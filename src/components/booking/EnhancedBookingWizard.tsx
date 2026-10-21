import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  Settings,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  FileText,
  CreditCard
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  tenant_price: number;
  au_affiliate_price: number;
  external_price: number;
  lead_time: string;
}

interface Resource {
  id: string;
  name: string;
  type: string;
  description: string;
  location: string;
  capacity: number;
  hourly_rate: number;
  specifications: any;
  booking_rules: any;
}

interface Profile {
  tenant_type: string;
}

interface BookingWizardProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const steps = [
  { id: 'service', title: 'Service Details', icon: FileText },
  { id: 'datetime', title: 'Date & Time', icon: CalendarIcon },
  { id: 'resources', title: 'Resources', icon: Settings },
  { id: 'requirements', title: 'Requirements', icon: Users },
  { id: 'confirmation', title: 'Confirmation', icon: CheckCircle2 }
];

const EnhancedBookingWizard = ({ service, isOpen, onClose, onSuccess }: BookingWizardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Booking form data
  const [bookingData, setBookingData] = useState({
    scheduled_date: new Date(),
    scheduled_time: '09:00',
    duration_hours: 1,
    location: '',
    requirements: '',
    priority: 'standard',
    selectedResources: [] as string[],
    notes: ''
  });

  useEffect(() => {
    if (isOpen && user) {
      fetchUserProfile();
      fetchResources();
    }
  }, [isOpen, user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('tenant_type')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setUserProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('available', true)
        .order('type, name');

      if (error) throw error;
      setResources(data || []);
    } catch (error: any) {
      console.error('Error fetching resources:', error);
    }
  };

  const getServicePrice = () => {
    if (!service) return 0;
    const tenantType = userProfile?.tenant_type || 'external';
    
    switch (tenantType) {
      case 'tenant':
        return service.tenant_price;
      case 'au_affiliate':
        return service.au_affiliate_price;
      default:
        return service.external_price;
    }
  };

  const calculateResourcesCost = () => {
    return bookingData.selectedResources.reduce((total, resourceId) => {
      const resource = resources.find(r => r.id === resourceId);
      return total + (resource ? resource.hourly_rate * bookingData.duration_hours : 0);
    }, 0);
  };

  const getTotalCost = () => {
    return getServicePrice() + calculateResourcesCost();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmitBooking = async () => {
    if (!service || !user) return;

    setLoading(true);
    try {
      // Create the booking
      const { data: bookingResult, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          service_id: service.id,
          scheduled_date: bookingData.scheduled_date.toISOString().split('T')[0],
          scheduled_time: bookingData.scheduled_time,
          duration_hours: bookingData.duration_hours,
          location: bookingData.location,
          requirements: bookingData.requirements,
          priority: bookingData.priority,
          notes: bookingData.notes,
          quote_amount: getTotalCost(),
          status: 'pending'
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create resource bookings if any resources selected
      if (bookingData.selectedResources.length > 0) {
        const startDateTime = new Date(`${bookingData.scheduled_date.toISOString().split('T')[0]}T${bookingData.scheduled_time}`);
        const endDateTime = new Date(startDateTime);
        endDateTime.setHours(endDateTime.getHours() + bookingData.duration_hours);

        const resourceBookings = bookingData.selectedResources.map(resourceId => ({
          booking_id: bookingResult.id,
          resource_id: resourceId,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          quantity: 1
        }));

        const { error: resourceError } = await supabase
          .from('booking_resources')
          .insert(resourceBookings);

        if (resourceError) throw resourceError;
      }

      // Create notification
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: 'Booking Submitted Successfully',
          message: `Your booking for ${service.name} has been submitted and is pending approval.`,
          type: 'success',
          booking_id: bookingResult.id
        });

      toast({
        title: "Booking Submitted Successfully!",
        description: `Your booking for ${service.name} has been submitted for review. Confirmation number: ${bookingResult.confirmation_number}`
      });

      onSuccess();
      onClose();
      
      // Reset form
      setCurrentStep(0);
      setBookingData({
        scheduled_date: new Date(),
        scheduled_time: '09:00',
        duration_hours: 1,
        location: '',
        requirements: '',
        priority: 'standard',
        selectedResources: [],
        notes: ''
      });

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Booking Failed",
        description: error.message || "Failed to submit booking"
      });
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = (stepIndex: number) => {
    switch (stepIndex) {
      case 0: return service !== null;
      case 1: return bookingData.scheduled_date && bookingData.scheduled_time && bookingData.duration_hours > 0;
      case 2: return true; // Resources are optional
      case 3: return true; // Requirements are optional
      case 4: return true; // Confirmation step
      default: return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Service Overview</h3>
              <p className="text-muted-foreground">Review the service details before booking</p>
            </div>
            
            {service && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{service.name}</CardTitle>
                    <Badge variant="secondary">{service.category}</Badge>
                  </div>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Lead Time: {service.lead_time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold">
                        LE {getServicePrice().toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Schedule Your Service</h3>
              <p className="text-muted-foreground">Select your preferred date and time</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label>Preferred Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !bookingData.scheduled_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {bookingData.scheduled_date ? format(bookingData.scheduled_date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={bookingData.scheduled_date}
                      onSelect={(date) => date && setBookingData({...bookingData, scheduled_date: date})}
                      disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-4">
                <Label htmlFor="time">Preferred Time</Label>
                <Select 
                  value={bookingData.scheduled_time} 
                  onValueChange={(value) => setBookingData({...bookingData, scheduled_time: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => {
                      const hour = 8 + i;
                      const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                      return (
                        <SelectItem key={timeStr} value={timeStr}>
                          {timeStr}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label htmlFor="duration">Duration (hours)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="8"
                  value={bookingData.duration_hours}
                  onChange={(e) => setBookingData({...bookingData, duration_hours: parseInt(e.target.value) || 1})}
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={bookingData.priority} 
                  onValueChange={(value) => setBookingData({...bookingData, priority: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Additional Resources</h3>
              <p className="text-muted-foreground">Select any equipment or facilities you need</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {resources.map((resource) => (
                <Card key={resource.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={bookingData.selectedResources.includes(resource.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setBookingData({
                                ...bookingData,
                                selectedResources: [...bookingData.selectedResources, resource.id]
                              });
                            } else {
                              setBookingData({
                                ...bookingData,
                                selectedResources: bookingData.selectedResources.filter(id => id !== resource.id)
                              });
                            }
                          }}
                        />
                        <div>
                          <CardTitle className="text-base">{resource.name}</CardTitle>
                          <CardDescription className="text-sm">{resource.description}</CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{resource.type}</Badge>
                        <p className="text-sm font-semibold mt-1">
                          LE {resource.hourly_rate}/hour
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {resource.location}
                        </span>
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          Capacity: {resource.capacity}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {bookingData.selectedResources.length > 0 && (
              <Card className="bg-accent/5">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Resources Cost:</span>
                    <span className="font-semibold">
                      LE {calculateResourcesCost().toLocaleString()} 
                      <span className="text-sm text-muted-foreground ml-1">
                        ({bookingData.duration_hours}h)
                      </span>
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Special Requirements</h3>
              <p className="text-muted-foreground">Add any specific requirements or notes</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="location">Preferred Location (Optional)</Label>
                <Input
                  id="location"
                  placeholder="e.g., Main Lab, Conference Room A"
                  value={bookingData.location}
                  onChange={(e) => setBookingData({...bookingData, location: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="requirements">Technical Requirements</Label>
                <Textarea
                  id="requirements"
                  placeholder="Describe any specific technical requirements, sample preparation needs, or special conditions..."
                  value={bookingData.requirements}
                  onChange={(e) => setBookingData({...bookingData, requirements: e.target.value})}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any other information that would help us prepare for your service..."
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Review & Confirm</h3>
              <p className="text-muted-foreground">Please review your booking details</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Service</Label>
                    <p className="font-medium">{service?.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                    <p className="font-medium">{service?.category}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Date & Time</Label>
                    <p className="font-medium">
                      {format(bookingData.scheduled_date, "PPP")} at {bookingData.scheduled_time}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
                    <p className="font-medium">{bookingData.duration_hours} hour(s)</p>
                  </div>
                  {bookingData.location && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                      <p className="font-medium">{bookingData.location}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Priority</Label>
                    <Badge variant="outline" className="capitalize">{bookingData.priority}</Badge>
                  </div>
                </div>

                {bookingData.selectedResources.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Selected Resources</Label>
                    <div className="mt-2 space-y-1">
                      {bookingData.selectedResources.map(resourceId => {
                        const resource = resources.find(r => r.id === resourceId);
                        return resource ? (
                          <div key={resourceId} className="flex items-center justify-between text-sm">
                            <span>{resource.name}</span>
                            <span>LE {resource.hourly_rate * bookingData.duration_hours}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>Total Cost</span>
                    <span className="text-innovation">LE {getTotalCost().toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-accent/5">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span>
                    Your booking will be reviewed and confirmed within 24 hours. 
                    You'll receive a confirmation email with further details.
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Book Service - {service?.name}</DialogTitle>
          <DialogDescription>
            Complete the booking process step by step
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6 px-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
                index <= currentStep 
                  ? "bg-primary border-primary text-primary-foreground" 
                  : "border-muted-foreground text-muted-foreground"
              )}>
                <step.icon className="h-4 w-4" />
              </div>
              <span className={cn(
                "ml-2 text-sm font-medium transition-colors hidden sm:block",
                index <= currentStep ? "text-foreground" : "text-muted-foreground"
              )}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className={cn(
                  "hidden sm:block w-12 h-0.5 ml-4 transition-colors",
                  index < currentStep ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-1">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex space-x-2">
            {currentStep === steps.length - 1 ? (
              <Button
                onClick={handleSubmitBooking}
                disabled={loading}
                className="bg-gradient-lighthouse text-primary-foreground hover:opacity-90"
              >
                {loading ? 'Submitting...' : 'Submit Booking'}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!isStepValid(currentStep)}
                className="bg-gradient-lighthouse text-primary-foreground hover:opacity-90"
              >
                Next Step
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedBookingWizard;
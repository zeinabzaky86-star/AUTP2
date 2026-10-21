import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Calendar, 
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  XCircle,
  Eye,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface BookingWithService {
  id: string;
  status: string;
  booking_date: string;
  scheduled_date: string | null;
  notes: string | null;
  quote_amount: number;
  created_at: string;
  services: {
    name: string;
    category: string;
    lead_time: string;
  } | null;
}

const BookingHistory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingWithService[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingWithService[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter]);

  const fetchBookings = async () => {
    try {
      // Handle bypass user with mock data (using valid UUID)
      if (user?.id === '00000000-0000-0000-0000-000000000002') {
        const mockBookings = [
          {
            id: 'mock-booking-1',
            status: 'in_progress',
            booking_date: new Date().toISOString(),
            scheduled_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            notes: 'Urgent product testing required',
            quote_amount: 5000,
            created_at: new Date().toISOString(),
            services: {
              name: 'Product Testing',
              category: 'Scientific Services',
              lead_time: '2-3 weeks'
            }
          },
          {
            id: 'mock-booking-2',
            status: 'completed',
            booking_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            scheduled_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            notes: 'Market analysis for new product launch',
            quote_amount: 8000,
            created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            services: {
              name: 'Market Analysis',
              category: 'Business Consulting',
              lead_time: '3-4 weeks'
            }
          }
        ];
        setBookings(mockBookings);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          status,
          booking_date,
          scheduled_date,
          notes,
          quote_amount,
          created_at,
          services (
            name,
            category,
            lead_time
          )
        `)
        .eq('user_id', user?.id)
        .order('booking_date', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load booking history"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = bookings;

    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.services?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.services?.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    setFilteredBookings(filtered);
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: {
        icon: <Clock className="h-4 w-4" />,
        color: "bg-accent text-accent-foreground",
        label: "Pending Review"
      },
      approved: {
        icon: <CheckCircle className="h-4 w-4" />,
        color: "bg-innovation text-innovation-foreground",
        label: "Approved"
      },
      in_progress: {
        icon: <TrendingUp className="h-4 w-4" />,
        color: "bg-primary text-primary-foreground",
        label: "In Progress"
      },
      completed: {
        icon: <CheckCircle className="h-4 w-4" />,
        color: "bg-success text-success-foreground",
        label: "Completed"
      },
      cancelled: {
        icon: <XCircle className="h-4 w-4" />,
        color: "bg-destructive text-destructive-foreground",
        label: "Cancelled"
      }
    };

    return configs[status as keyof typeof configs] || {
      icon: <AlertCircle className="h-4 w-4" />,
      color: "bg-muted text-muted-foreground",
      label: status
    };
  };

  const statuses = ['all', 'pending', 'approved', 'in_progress', 'completed', 'cancelled'];

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-muted rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Booking History</h2>
        <p className="text-muted-foreground">
          Track and manage your service bookings and requests.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map(status => (
              <SelectItem key={status} value={status}>
                {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No bookings found</p>
              <p className="text-sm text-muted-foreground">
                {bookings.length === 0 
                  ? "You haven't made any bookings yet" 
                  : "Try adjusting your search filters"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredBookings.map((booking) => {
            const statusConfig = getStatusConfig(booking.status);
            
            return (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {booking.services?.name || 'Unknown Service'}
                      </CardTitle>
                      <CardDescription>
                        {booking.services?.category} • Booked on {new Date(booking.booking_date).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {statusConfig.icon}
                      <Badge className={statusConfig.color}>
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Quote Amount</p>
                      <div className="flex items-center text-lg font-semibold text-innovation">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {Number(booking.quote_amount).toLocaleString()}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Lead Time</p>
                      <p className="text-sm">{booking.services?.lead_time || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Booking ID</p>
                      <p className="text-sm font-mono">{booking.id.slice(0, 8)}...</p>
                    </div>
                  </div>

                  {booking.scheduled_date && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Scheduled Date</p>
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-accent" />
                        {new Date(booking.scheduled_date).toLocaleDateString()} at {new Date(booking.scheduled_date).toLocaleTimeString()}
                      </div>
                    </div>
                  )}

                  {booking.notes && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Notes</p>
                      <p className="text-sm bg-muted p-2 rounded">{booking.notes}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(booking.created_at).toLocaleDateString()}
                    </p>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      
                      {booking.status === 'completed' && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download Report
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BookingHistory;
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Clock, 
  Calendar,
  Microscope,
  Briefcase,
  Scale,
  Rocket,
  Palette,
  GraduationCap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import EnhancedBookingWizard from '../booking/EnhancedBookingWizard';

interface Service {
  id: string;
  category: string;
  name: string;
  description: string;
  tenant_price: number;
  au_affiliate_price: number;
  external_price: number;
  lead_time: string;
}

interface Profile {
  tenant_type: string;
}

const ServiceCatalog = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingWizardOpen, setBookingWizardOpen] = useState(false);

  useEffect(() => {
    fetchServices();
    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm, categoryFilter]);

  const fetchServices = async () => {
    try {
      // Handle bypass user with mock data (using valid UUID)
      if (user?.id === '00000000-0000-0000-0000-000000000002') {
        const mockServices = [
          {
            id: 'mock-service-1',
            category: 'Scientific Services',
            name: 'Product Testing',
            description: 'Comprehensive testing services for your products',
            tenant_price: 5000,
            au_affiliate_price: 4000,
            external_price: 6000,
            lead_time: '2-3 weeks'
          },
          {
            id: 'mock-service-2',
            category: 'Business Consulting',
            name: 'Market Analysis',
            description: 'In-depth market research and analysis',
            tenant_price: 8000,
            au_affiliate_price: 7000,
            external_price: 10000,
            lead_time: '3-4 weeks'
          }
        ];
        setServices(mockServices);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('available', true)
        .order('category');

      if (error) throw error;
      setServices(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load services"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      // Handle bypass user with mock profile (using valid UUID)
      if (user?.id === '00000000-0000-0000-0000-000000000002') {
        setUserProfile({ tenant_type: 'external' });
        return;
      }

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

  const filterServices = () => {
    let filtered = services;

    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(service => 
        service.category.toLowerCase().includes(categoryFilter.toLowerCase())
      );
    }

    setFilteredServices(filtered);
  };

  const getServicePrice = (service: Service) => {
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

  const getCategoryIcon = (category: string) => {
    if (category.includes('Scientific')) return <Microscope className="h-5 w-5" />;
    if (category.includes('Business')) return <Briefcase className="h-5 w-5" />;
    if (category.includes('Legal')) return <Scale className="h-5 w-5" />;
    if (category.includes('Startup')) return <Rocket className="h-5 w-5" />;
    if (category.includes('Creative')) return <Palette className="h-5 w-5" />;
    if (category.includes('Education')) return <GraduationCap className="h-5 w-5" />;
    return <Briefcase className="h-5 w-5" />;
  };

  const handleBookService = (service: Service) => {
    setSelectedService(service);
    setBookingWizardOpen(true);
  };

  const handleBookingSuccess = () => {
    // Refresh services or update UI as needed
    fetchServices();
  };

  const categories = [
    'all',
    'scientific',
    'business', 
    'legal',
    'startup',
    'creative',
    'education'
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Service Catalog</h2>
        <p className="text-muted-foreground">
          Explore and book our comprehensive range of innovation services.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <Card key={service.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 text-accent">
                  {getCategoryIcon(service.category)}
                  <Badge variant="secondary" className="text-xs">
                    {service.category}
                  </Badge>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {service.lead_time}
                </div>
              </div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {service.name}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {service.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-lg font-semibold text-innovation">
                    <span className="font-bold mr-1">LE</span>
                    {getServicePrice(service)?.toLocaleString()}
                  </div>
                  {userProfile?.tenant_type === 'tenant' && (
                    <Badge className="bg-success text-success-foreground">
                      Tenant Rate
                    </Badge>
                  )}
                </div>

                <Button 
                  className="w-full bg-gradient-lighthouse text-primary-foreground hover:opacity-90"
                  onClick={() => handleBookService(service)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Service
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredServices.length === 0 && !loading && (
        <div className="text-center py-8">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No services found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}

      {/* Enhanced Booking Wizard */}
      <EnhancedBookingWizard
        service={selectedService}
        isOpen={bookingWizardOpen}
        onClose={() => {
          setBookingWizardOpen(false);
          setSelectedService(null);
        }}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
};

export default ServiceCatalog;
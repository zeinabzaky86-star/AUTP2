import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  FileText, 
  Plus, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Microscope,
  Briefcase,
  Scale
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import ServiceCatalog from './ServiceCatalog';
import BookingHistory from './BookingHistory';

interface DashboardStats {
  activeBookings: number;
  completedServices: number;
  totalSpent: number;
  pendingInvoices: number;
}

interface RecentBooking {
  id: string;
  service_name: string;
  category: string;
  status: string;
  booking_date: string;
  quote_amount: number;
}

const TenantDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    activeBookings: 0,
    completedServices: 0,
    totalSpent: 0,
    pendingInvoices: 0
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Handle bypass user with mock data (using valid UUID)
      if (user?.id === '00000000-0000-0000-0000-000000000002') {
        setStats({
          activeBookings: 3,
          completedServices: 12,
          totalSpent: 45000,
          pendingInvoices: 2
        });
        
        setRecentBookings([
          {
            id: 'mock-1',
            service_name: 'Product Testing',
            category: 'Scientific Services',
            status: 'in_progress',
            booking_date: new Date().toISOString(),
            quote_amount: 5000
          },
          {
            id: 'mock-2',
            service_name: 'Market Analysis',
            category: 'Business Consulting',
            status: 'completed',
            booking_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            quote_amount: 8000
          }
        ]);
        
        setLoading(false);
        return;
      }

      // Fetch bookings with service details
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          id,
          status,
          booking_date,
          quote_amount,
          services (
            name,
            category
          )
        `)
        .eq('user_id', user?.id)
        .order('booking_date', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Calculate stats
      const activeCount = bookings?.filter(b => ['pending', 'approved', 'in_progress'].includes(b.status)).length || 0;
      const completedCount = bookings?.filter(b => b.status === 'completed').length || 0;
      const totalSpent = bookings
        ?.filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (Number(b.quote_amount) || 0), 0) || 0;

      // Calculate pending invoices from approved bookings
      const pendingInvoicesCount = bookings?.filter(b => b.status === 'approved').length || 0;

      setStats({
        activeBookings: activeCount,
        completedServices: completedCount,
        totalSpent,
        pendingInvoices: pendingInvoicesCount
      });

      // Format recent bookings
      const formattedBookings = bookings?.map(booking => ({
        id: booking.id,
        service_name: booking.services?.name || 'Unknown Service',
        category: booking.services?.category || 'General',
        status: booking.status,
        booking_date: booking.booking_date,
        quote_amount: Number(booking.quote_amount) || 0
      })) || [];

      setRecentBookings(formattedBookings);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard data"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-accent" />;
      case 'in_progress':
        return <TrendingUp className="h-4 w-4 text-innovation" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    if (category.includes('Scientific')) return <Microscope className="h-4 w-4" />;
    if (category.includes('Business')) return <Briefcase className="h-4 w-4" />;
    if (category.includes('Legal')) return <Scale className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {user?.email?.split('@')[0]}!
        </h1>
        <p className="text-muted-foreground">
          Manage your Alexandria University Technology Park services and track your innovation journey.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{stats.activeBookings}</div>
            <p className="text-xs text-muted-foreground">
              Services in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Services</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.completedServices}</div>
            <p className="text-xs text-muted-foreground">
              Successfully delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-innovation">
              LE {stats.totalSpent.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Lifetime investment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.pendingInvoices}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting payment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Book Services</TabsTrigger>
          <TabsTrigger value="bookings">My Bookings</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>
                    Your latest service requests and their status
                  </CardDescription>
                </div>
                <Button size="sm" className="bg-gradient-lighthouse text-primary-foreground hover:opacity-90">
                  <Plus className="h-4 w-4 mr-2" />
                  New Booking
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentBookings.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No bookings yet</p>
                  <p className="text-sm text-muted-foreground">
                    Start by exploring our service catalog
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div 
                      key={booking.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        {getCategoryIcon(booking.category)}
                        <div>
                          <p className="font-medium text-foreground">
                            {booking.service_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {booking.category} • {new Date(booking.booking_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium text-foreground">
                            LE {booking.quote_amount.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(booking.status)}
                          <Badge variant="secondary" className="capitalize">
                            {booking.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <ServiceCatalog />
        </TabsContent>

        <TabsContent value="bookings">
          <BookingHistory />
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents & Contracts</CardTitle>
              <CardDescription>
                Access your service agreements, invoices, and certificates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Contracts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-foreground">0</p>
                      <p className="text-xs text-muted-foreground">Active agreements</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Invoices</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-foreground">{stats.pendingInvoices}</p>
                      <p className="text-xs text-muted-foreground">Pending payment</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    Documents will appear here once services are completed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TenantDashboard;
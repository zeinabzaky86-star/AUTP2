
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TenantHeader from '@/components/tenant/TenantHeader';
import { EnhancedAdminServicesManager } from '@/components/admin/EnhancedAdminServicesManager';
import AdminNewsManager from '@/components/admin/AdminNewsManager';
import { useToast } from '@/hooks/use-toast';
import { AdminMFASetup } from '@/components/admin/AdminMFASetup';
import { useAdminMFA } from '@/hooks/useAdminMFA';
import AdminApplicationsManager from '@/components/admin/AdminApplicationsManager';

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading, isAdmin, assignAdminRole, checkCanBootstrapAdmin } = useUserRole();
  
  console.log('AdminDashboard: user:', user, 'authLoading:', authLoading, 'role:', role, 'roleLoading:', roleLoading, 'isAdmin:', isAdmin);
  const { toast } = useToast();
  const { isMFAEnabled } = useAdminMFA();
  const [canBootstrap, setCanBootstrap] = useState(false);
  const [bootstrapLoading, setBootstrapLoading] = useState(true);
  const [showMFASetup, setShowMFASetup] = useState(false);

  useEffect(() => {
    const checkBootstrap = async () => {
      if (user && !isAdmin && !roleLoading) {
        const canBootstrap = await checkCanBootstrapAdmin();
        setCanBootstrap(canBootstrap);
      }
      setBootstrapLoading(false);
    };
    
    checkBootstrap();
  }, [user, isAdmin, roleLoading, checkCanBootstrapAdmin]);

  const handleBecomeAdmin = async () => {
    const { error } = await assignAdminRole();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error
      });
    } else {
      toast({
        title: "Success!",
        description: "You are now an admin. Please refresh the page."
      });
    }
  };

  if (authLoading || roleLoading || bootstrapLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('AdminDashboard: no user, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // If user is not admin but can bootstrap, show bootstrap option
  if (!isAdmin && canBootstrap) {
    return (
      <div className="min-h-screen bg-background">
        <TenantHeader />
        <main className="container mx-auto px-6 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Admin Access</CardTitle>
              <CardDescription>
                No administrators have been set up yet. As the first user, you can make yourself an admin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleBecomeAdmin}
                className="w-full bg-gradient-lighthouse text-primary-foreground hover:opacity-90"
              >
                Become Admin
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    console.log('AdminDashboard: user not admin, redirecting to tenant');
    return <Navigate to="/tenant" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <TenantHeader />
      <main className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Security Notice */}
        {!isMFAEnabled && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                    Two-Factor Authentication Required
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    For enhanced security, please set up MFA for your admin account.
                  </p>
                </div>
                <Button 
                  onClick={() => setShowMFASetup(true)}
                  variant="outline"
                  size="tablet"
                  className="border-yellow-300 text-yellow-800 hover:bg-yellow-100 dark:border-yellow-700 dark:text-yellow-200 dark:hover:bg-yellow-900"
                >
                  Set Up MFA
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1 bg-muted">
            <TabsTrigger 
              value="applications" 
              className="h-11 text-sm md:text-base font-medium data-[state=active]:bg-background data-[state=active]:text-primary"
            >
              Applications
            </TabsTrigger>
            <TabsTrigger 
              value="services" 
              className="h-11 text-sm md:text-base font-medium data-[state=active]:bg-background data-[state=active]:text-primary"
            >
              <span className="hidden md:inline">Services Management</span>
              <span className="md:hidden">Services</span>
            </TabsTrigger>
            <TabsTrigger 
              value="news" 
              className="h-11 text-sm md:text-base font-medium data-[state=active]:bg-background data-[state=active]:text-primary"
            >
              <span className="hidden md:inline">News & Updates</span>
              <span className="md:hidden">News</span>
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="h-11 text-sm md:text-base font-medium data-[state=active]:bg-background data-[state=active]:text-primary"
            >
              Security
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="applications" className="space-y-6">
            <AdminApplicationsManager />
          </TabsContent>
          
          <TabsContent value="services" className="space-y-6">
            <EnhancedAdminServicesManager />
          </TabsContent>
          
          <TabsContent value="news" className="space-y-6">
            <AdminNewsManager />
          </TabsContent>
          
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage security settings for your admin account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button 
                    onClick={() => setShowMFASetup(true)}
                    variant={isMFAEnabled ? "outline" : "default"}
                    size="tablet"
                    className="min-w-[120px]"
                  >
                    {isMFAEnabled ? "Manage MFA" : "Set Up MFA"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <AdminMFASetup 
          open={showMFASetup} 
          onOpenChange={setShowMFASetup} 
        />
      </main>
    </div>
  );
};

export default AdminDashboard;

import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import TenantDashboard from '@/components/tenant/TenantDashboard';
import TenantHeader from '@/components/tenant/TenantHeader';

const TenantPortal = () => {
  const { user, loading } = useAuth();

  console.log('TenantPortal: user:', user, 'loading:', loading);

  if (loading) {
    console.log('TenantPortal: showing loading state');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('TenantPortal: no user, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <TenantHeader />
      <main className="container mx-auto px-6 py-8">
        <TenantDashboard />
      </main>
    </div>
  );
};

export default TenantPortal;
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/useAuth';
import { QueryProvider } from '@/hooks/useQuery';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import NotFound from '@/pages/NotFound';
import TenantPortal from '@/pages/TenantPortal';
import AdminDashboard from '@/pages/AdminDashboard';
import NewsUpdates from '@/pages/NewsUpdates';
import ApplicationForm from '@/pages/ApplicationForm';
import ApplicationStatus from '@/pages/ApplicationStatus';
import PerformanceTesting from '@/pages/PerformanceTesting';
import Services from '@/pages/Services';
import TestingDashboard from '@/components/TestingDashboard';

function App() {
  return (
    <AuthProvider>
      <QueryProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Toaster />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/tenant" element={<TenantPortal />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/news" element={<NewsUpdates />} />
              <Route path="/apply" element={<ApplicationForm />} />
              <Route path="/application-status" element={<ApplicationStatus />} />
              <Route path="/performance" element={<PerformanceTesting />} />
              <Route path="/services" element={<Services />} />
              <Route path="/testing" element={<TestingDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </QueryProvider>
    </AuthProvider>
  );
}

export default App;

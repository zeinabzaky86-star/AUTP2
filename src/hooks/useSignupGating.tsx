import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to manage signup gating - restricts signups until first admin is created
 * or to trusted domains only
 */
export const useSignupGating = () => {
  const [signupsAllowed, setSignupsAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminExists, setAdminExists] = useState(false);

  // Trusted domains for signup (can be configured)
  const TRUSTED_DOMAINS = ['alexandria.edu.eg', 'alexu.edu.eg'];
  
  useEffect(() => {
    checkSignupStatus();
  }, []);

  const checkSignupStatus = async () => {
    try {
      // Check if any admin exists
      const { data: adminCount, error } = await supabase.rpc('admin_count');
      
      if (error) {
        console.error('Error checking admin count:', error);
        setSignupsAllowed(false);
        return;
      }

      const hasAdmin = adminCount > 0;
      setAdminExists(hasAdmin);
      
      // Allow signups if admin exists (normal operation)
      setSignupsAllowed(hasAdmin);
      
    } catch (error) {
      console.error('Error in signup gating check:', error);
      setSignupsAllowed(false);
    } finally {
      setLoading(false);
    }
  };

  const isEmailAllowed = (email: string): boolean => {
    if (adminExists) {
      return true; // Normal operation once admin exists
    }
    
    // Before first admin, only allow trusted domains
    const domain = email.split('@')[1]?.toLowerCase();
    return TRUSTED_DOMAINS.includes(domain);
  };

  const getSignupError = (email: string): string | null => {
    if (loading) return 'Checking signup availability...';
    
    if (!adminExists && !isEmailAllowed(email)) {
      return `Signups are currently restricted to trusted domains: ${TRUSTED_DOMAINS.join(', ')}`;
    }
    
    return null;
  };

  return {
    signupsAllowed,
    adminExists,
    loading,
    isEmailAllowed,
    getSignupError,
    checkSignupStatus
  };
};
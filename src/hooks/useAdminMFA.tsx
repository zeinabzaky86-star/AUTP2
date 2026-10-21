import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';

interface TOTPSecret {
  secret: string;
  qr_code: string;
  uri: string;
}

export const useAdminMFA = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { toast } = useToast();
  const [isMFAEnabled, setIsMFAEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totpSecret, setTotpSecret] = useState<TOTPSecret | null>(null);

  useEffect(() => {
    if (user && isAdmin) {
      checkMFAStatus();
    } else {
      setLoading(false);
    }
  }, [user, isAdmin]);

  const checkMFAStatus = async () => {
    try {
      // Handle bypass user - don't require MFA for development (using valid UUID)
      if (user?.id === '00000000-0000-0000-0000-000000000001') {
        setIsMFAEnabled(true); // Pretend MFA is enabled for bypass user
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;

      const totpFactor = data.totp.find(factor => factor.status === 'verified');
      setIsMFAEnabled(!!totpFactor);
    } catch (error) {
      console.error('Error checking MFA status:', error);
    } finally {
      setLoading(false);
    }
  };

  const enrollMFA = async () => {
    try {
      // Handle bypass user - mock MFA enrollment (using valid UUID)
      if (user?.id === '00000000-0000-0000-0000-000000000001') {
        toast({
          title: "Development Mode",
          description: "MFA enrollment is skipped for development user"
        });
        return null;
      }

      setLoading(true);
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Alexandria ATP Admin'
      });

      if (error) throw error;

      setTotpSecret({
        secret: data.totp.secret,
        qr_code: data.totp.qr_code,
        uri: data.totp.uri
      });

      return data;
    } catch (error) {
      console.error('Error enrolling MFA:', error);
      toast({
        variant: "destructive",
        title: "MFA Enrollment Failed",
        description: error instanceof Error ? error.message : 'Failed to set up MFA'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyMFA = async (token: string, factorId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: '', // Will be set by the factor
        code: token
      });

      if (error) throw error;

      setIsMFAEnabled(true);
      setTotpSecret(null);
      
      toast({
        title: "MFA Enabled",
        description: "Two-factor authentication has been successfully enabled for your admin account."
      });

      return data;
    } catch (error) {
      console.error('Error verifying MFA:', error);
      toast({
        variant: "destructive",
        title: "MFA Verification Failed",
        description: error instanceof Error ? error.message : 'Invalid verification code'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const unenrollMFA = async () => {
    try {
      // Handle bypass user - mock MFA unenrollment (using valid UUID)
      if (user?.id === '00000000-0000-0000-0000-000000000001') {
        toast({
          title: "Development Mode",
          description: "MFA operations are skipped for development user"
        });
        return;
      }

      setLoading(true);
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactor = factors.totp.find(factor => factor.status === 'verified');
      
      if (totpFactor) {
        const { error } = await supabase.auth.mfa.unenroll({
          factorId: totpFactor.id
        });
        
        if (error) throw error;
        
        setIsMFAEnabled(false);
        toast({
          title: "MFA Disabled",
          description: "Two-factor authentication has been disabled."
        });
      }
    } catch (error) {
      console.error('Error unenrolling MFA:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to disable MFA'
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    isMFAEnabled,
    loading,
    totpSecret,
    enrollMFA,
    verifyMFA,
    unenrollMFA,
    checkMFAStatus
  };
};
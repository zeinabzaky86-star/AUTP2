
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type UserRole = 'admin' | null;

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    fetchUserRole();
  }, [user]);

  const fetchUserRole = async () => {
    try {
      // Check for temporary bypass users (using valid UUIDs)
      if (user?.id === '00000000-0000-0000-0000-000000000001') {
        setRole('admin');
        setLoading(false);
        return;
      }
      
      if (user?.id === '00000000-0000-0000-0000-000000000002') {
        setRole(null); // Regular tenant user
        setLoading(false);
        return;
      }

      // Query user_roles table
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setRole(data?.role === 'admin' ? 'admin' : null);
    } catch (error) {
      console.error('Error fetching user role:', error);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  const checkCanBootstrapAdmin = async () => {
    try {
      const { data, error } = await supabase
        .rpc('admin_count');
      
      if (error) throw error;
      return data === 0;
    } catch (error) {
      console.error('Error checking admin count:', error);
      return false;
    }
  };

  const assignAdminRole = async () => {
    if (!user) return { error: 'No user found' };

    const canBootstrap = await checkCanBootstrapAdmin();
    if (!canBootstrap) {
      return { error: 'Admin already exists. Only existing admins can create new admins.' };
    }

    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'admin'
        });

      if (error) throw error;

      setRole('admin');
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  return {
    role,
    loading,
    isAdmin: role === 'admin',
    assignAdminRole,
    checkCanBootstrapAdmin
  };
};

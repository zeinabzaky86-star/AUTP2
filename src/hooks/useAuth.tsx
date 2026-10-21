import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  bypassAuth: (role?: 'admin' | 'tenant') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [tempBypass, setTempBypass] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName
        }
      }
    });

    if (error) {
      // Log detailed error for debugging but show generic message to user
      console.error('Sign up error:', error.message);
      
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: "Unable to create account. Please try again."
      });
    } else {
      toast({
        title: "Success!",
        description: "Please check your email to confirm your account."
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      // Log detailed error for debugging but show generic message to user
      console.error('Sign in error:', error.message);
      
      toast({
        variant: "destructive",
        title: "Sign In Failed",
        description: "Invalid credentials. Please try again."
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "Successfully signed in."
      });
    }

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Sign Out Failed",
        description: error.message
      });
    }
    setTempBypass(false);
  };

  const bypassAuth = (role: 'admin' | 'tenant' = 'tenant') => {
    // Create a temporary mock user for bypass access with valid UUID
    const mockUser = {
      id: role === 'admin' ? '00000000-0000-0000-0000-000000000001' : '00000000-0000-0000-0000-000000000002',
      aud: 'authenticated',
      email: `temp-${role}@bypass.local`,
      created_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: { full_name: `Temporary ${role === 'admin' ? 'Admin' : 'User'}`, bypass_role: role },
      role: 'authenticated',
      email_confirmed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as User;
    
    setUser(mockUser);
    setTempBypass(true);
    setLoading(false);
    
    toast({
      title: "Temporary Access Granted",
      description: `Authentication bypassed for ${role} access`
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut,
      bypassAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
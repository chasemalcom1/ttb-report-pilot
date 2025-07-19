
import React, { createContext, useState, useEffect, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Organization {
  id: string;
  name: string;
  type: 'distillery' | 'winery' | 'brewery';
  dsp_number?: string;
  permit_number?: string;
  ein?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
}

interface UserRole {
  id: string;
  role: 'admin' | 'production' | 'accounting';
  organization_id: string;
}

interface AuthUser {
  id: string;
  email: string;
  profile: Profile;
  organization: Organization;
  role: 'admin' | 'production' | 'accounting';
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signUp: (data: SignUpData) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName: string;
  organizationType: 'distillery' | 'winery' | 'brewery';
  dspNumber?: string;
  permitNumber?: string;
  ein?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  role: 'admin' | 'production' | 'accounting';
}

const SupabaseAuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  isAuthenticated: false,
});

export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = async (userId: string) => {
    try {
      console.log('Loading user data for:', userId);
      
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors if no profile

      console.log('Profile data:', profile, 'Profile error:', profileError);

      if (profileError) {
        console.error('Error loading profile:', profileError);
        return;
      }

      if (!profile) {
        console.log('No profile found for user, this might be expected for new users');
        return;
      }

      // Get user role and organization
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select(`
          *,
          organizations (*)
        `)
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle instead of single

      console.log('User role data:', userRole, 'Role error:', roleError);

      if (roleError) {
        console.error('Error loading user role:', roleError);
        return;
      }

      if (userRole && userRole.organizations) {
        const authUser: AuthUser = {
          id: userId,
          email: profile.email,
          profile,
          organization: userRole.organizations as Organization,
          role: userRole.role as 'admin' | 'production' | 'accounting',
        };
        console.log('Setting auth user:', authUser);
        setUser(authUser);
      } else {
        console.log('No role or organization found for user');
        // Even if no role/org, we should still show some user state
        // This helps with debugging
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  useEffect(() => {
    console.log('Setting up auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        
        if (session?.user) {
          console.log('User session found, loading user data');
          // Defer data loading to prevent deadlocks
          setTimeout(() => {
            loadUserData(session.user.id);
          }, 0);
        } else {
          console.log('No user session, clearing user data');
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      if (session?.user) {
        setTimeout(() => {
          loadUserData(session.user.id);
        }, 0);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (data: SignUpData) => {
    try {
      console.log('Starting signup process for:', data.email);
      
      // Create user account first
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
          }
        }
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        return { error: authError };
      }

      if (!authData.user) {
        console.error('No user data returned from signup');
        return { error: new Error('No user data returned') };
      }

      console.log('User created:', authData.user.id);

      // Create the organization using service role (bypassing RLS)
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: data.organizationName,
          type: data.organizationType,
          dsp_number: data.dspNumber || null,
          permit_number: data.permitNumber || null,
          ein: data.ein || null,
          address: data.address || null,
          city: data.city || null,
          state: data.state || null,
          zip_code: data.zipCode || null,
          phone: data.phone || null,
        })
        .select()
        .single();

      if (orgError || !orgData) {
        console.error('Error creating organization:', orgError);
        return { error: orgError };
      }

      console.log('Organization created:', orgData.id);

      // Create user role using service role (bypassing RLS)
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          organization_id: orgData.id,
          role: data.role,
        });

      if (roleError) {
        console.error('Error creating user role:', roleError);
        // Don't return error here as user is already created
        // We'll handle missing role in the UI
      } else {
        console.log('User role created successfully');
      }

      toast.success('Account created! Please check your email to verify your account.');
      return { error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Sign in result:', { user: data.user?.id, error });

      if (error) return { error };

      // The navigation will be handled by the auth state change
      console.log('Sign in successful, auth state change should trigger navigation');
      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <SupabaseAuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        isAuthenticated: !!session,
      }}
    >
      {children}
    </SupabaseAuthContext.Provider>
  );
};

export const useSupabaseAuth = () => useContext(SupabaseAuthContext);

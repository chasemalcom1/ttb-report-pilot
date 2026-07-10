import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
}

interface Organization {
  id: string;
  name: string;
  type: 'distillery' | 'winery' | 'brewery';
  dsp_number?: string | null;
  permit_number?: string | null;
  ein?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  phone?: string | null;
}

interface AuthUser {
  id: string;
  email: string;
  profile: Profile;
  organization: Organization;
  role: 'admin' | 'production' | 'accounting';
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

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  /** Initial Supabase session check in progress */
  authLoading: boolean;
  /** Profile/org/role currently being loaded or provisioned */
  profileLoading: boolean;
  /** Non-recoverable provisioning error to surface in UI */
  provisioningError: string | null;
  /** Retry loading the user's profile/org/role, running recovery if needed */
  retryProvisioning: () => Promise<void>;
  /** Whether signup requires email confirmation before proceeding */
  awaitingEmailConfirmation: boolean;
  signUp: (data: SignUpData) => Promise<{ error: any; needsEmailConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const SupabaseAuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  authLoading: true,
  profileLoading: false,
  provisioningError: null,
  retryProvisioning: async () => {},
  awaitingEmailConfirmation: false,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  isAuthenticated: false,
});

const MAX_ATTEMPTS = 5;
const RETRY_DELAY_MS = 400;

export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [provisioningError, setProvisioningError] = useState<string | null>(null);
  const [awaitingEmailConfirmation, setAwaitingEmailConfirmation] = useState(false);

  // Guard against concurrent load attempts / stale user ids
  const activeLoadUserId = useRef<string | null>(null);

  const fetchProfileAndRole = useCallback(async (userId: string) => {
    const [{ data: profile, error: profileError }, { data: userRole, error: roleError }] =
      await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabase
          .from('user_roles')
          .select('role, organization_id, organizations(*)')
          .eq('user_id', userId)
          .limit(1)
          .maybeSingle(),
      ]);

    if (profileError) console.error('[auth] profile query error:', profileError);
    if (roleError) console.error('[auth] user_roles query error:', roleError);

    return { profile, userRole, profileError, roleError };
  }, []);

  const loadUserData = useCallback(
    async (userId: string) => {
      activeLoadUserId.current = userId;
      setProfileLoading(true);
      setProvisioningError(null);

      try {
        let lastErr: any = null;

        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
          if (activeLoadUserId.current !== userId) return; // superseded
          const { profile, userRole, profileError, roleError } = await fetchProfileAndRole(userId);
          lastErr = profileError || roleError;

          if (profile && userRole && userRole.organizations) {
            if (activeLoadUserId.current !== userId) return;
            setUser({
              id: userId,
              email: profile.email,
              profile,
              organization: userRole.organizations as unknown as Organization,
              role: userRole.role as AuthUser['role'],
            });
            setProfileLoading(false);
            return;
          }

          if (attempt < MAX_ATTEMPTS - 1) {
            await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
          }
        }

        // Final attempt: run server-side recovery
        console.warn('[auth] profile/role not found after retries; attempting recovery RPC');
        const { error: rpcError } = await supabase.rpc('ensure_user_provisioning', {
          _organization_name: null,
          _organization_type: null,
          _requested_role: null,
          _full_name: null,
        });
        if (rpcError) {
          console.error('[auth] ensure_user_provisioning error:', rpcError);
          lastErr = rpcError;
        } else {
          const { profile, userRole } = await fetchProfileAndRole(userId);
          if (profile && userRole && userRole.organizations) {
            setUser({
              id: userId,
              email: profile.email,
              profile,
              organization: userRole.organizations as unknown as Organization,
              role: userRole.role as AuthUser['role'],
            });
            setProfileLoading(false);
            return;
          }
        }

        setProvisioningError(
          lastErr?.message ||
            'We could not finish setting up your account. Please retry or sign out and try again.'
        );
      } catch (error: any) {
        console.error('[auth] loadUserData exception:', error);
        setProvisioningError(error?.message || 'Unexpected error loading your account.');
      } finally {
        setProfileLoading(false);
      }
    },
    [fetchProfileAndRole]
  );

  useEffect(() => {
    // Single onAuthStateChange listener. Only sync state here — never await.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (import.meta.env.DEV) console.log('[auth] event:', event, nextSession?.user?.email);
      setSession(nextSession);
      if (nextSession?.user) {
        setAwaitingEmailConfirmation(false);
        // Defer to avoid deadlocks inside the callback
        setTimeout(() => {
          void loadUserData(nextSession.user.id);
        }, 0);
      } else {
        activeLoadUserId.current = null;
        setUser(null);
        setProvisioningError(null);
        setProfileLoading(false);
      }
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session: initial } }) => {
      setSession(initial);
      if (initial?.user) {
        void loadUserData(initial.user.id);
      }
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  const retryProvisioning = useCallback(async () => {
    if (session?.user) {
      await loadUserData(session.user.id);
    }
  }, [session, loadUserData]);

  const signUp = async (data: SignUpData) => {
    try {
      const email = data.email.trim();
      const fullName = `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim();

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            // canonical keys
            full_name: fullName,
            organization_name: data.organizationName,
            organization_type: data.organizationType,
            requested_role: data.role,
            // convenience / legacy keys still stored for the trigger
            first_name: data.firstName,
            last_name: data.lastName,
            dsp_number: data.dspNumber ?? '',
            permit_number: data.permitNumber ?? '',
            ein: data.ein ?? '',
            address: data.address ?? '',
            city: data.city ?? '',
            state: data.state ?? '',
            zip_code: data.zipCode ?? '',
            phone: data.phone ?? '',
          },
        },
      });

      if (authError) {
        if (import.meta.env.DEV) console.error('[auth] signUp error:', authError);
        return { error: authError };
      }

      if (!authData.user) {
        return { error: new Error('No user returned from signup') };
      }

      // If a session came back, we are signed in (email confirmation disabled).
      if (authData.session) {
        toast.success('Account created!');
        return { error: null, needsEmailConfirmation: false };
      }

      // Otherwise the user must confirm their email before signing in.
      setAwaitingEmailConfirmation(true);
      toast.success('Check your email to confirm your account before signing in.');
      return { error: null, needsEmailConfirmation: true };
    } catch (error) {
      console.error('[auth] signUp exception:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password, // never trim the password
      });
      if (error) {
        if (import.meta.env.DEV) console.error('[auth] signIn error:', error);
        return { error };
      }
      if (import.meta.env.DEV) console.log('[auth] signIn ok:', data.user?.id);
      return { error: null };
    } catch (error) {
      console.error('[auth] signIn exception:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // Listener will clear user/session; clear proactively too.
      activeLoadUserId.current = null;
      setUser(null);
      setSession(null);
      setProvisioningError(null);
      toast.success('Signed out');
    } catch (error) {
      console.error('[auth] signOut error:', error);
    }
  };

  return (
    <SupabaseAuthContext.Provider
      value={{
        user,
        session,
        authLoading,
        profileLoading,
        provisioningError,
        retryProvisioning,
        awaitingEmailConfirmation,
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

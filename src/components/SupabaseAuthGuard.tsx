
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface SupabaseAuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: Array<'admin' | 'production' | 'accounting'>;
}

const SupabaseAuthGuard: React.FC<SupabaseAuthGuardProps> = ({ children, allowedRoles }) => {
  const { user, session, loading } = useSupabaseAuth();
  const location = useLocation();

  console.log('AuthGuard check - loading:', loading, 'user:', !!user, 'session:', !!session);

  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  // If we have a session but no user data yet, show loading
  // This can happen during email confirmation when user data is still being loaded
  if (session && !user) {
    console.log('Session exists but user data not loaded yet, showing loading...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Setting up your account...</span>
      </div>
    );
  }

  // If not authenticated, redirect to auth page
  if (!user) {
    console.log('No user found, redirecting to auth');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If allowedRoles is specified, check if the user has one of the required roles
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default SupabaseAuthGuard;

import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SupabaseAuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: Array<'admin' | 'production' | 'accounting'>;
}

const SupabaseAuthGuard: React.FC<SupabaseAuthGuardProps> = ({ children, allowedRoles }) => {
  const {
    user,
    session,
    authLoading,
    profileLoading,
    provisioningError,
    retryProvisioning,
    signOut,
  } = useSupabaseAuth();
  const location = useLocation();

  // 1) Initial session check
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  // 2) Not signed in → login
  if (!session) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // 3) Signed in but provisioning failed — offer recovery
  if (provisioningError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <h2 className="text-xl font-semibold">Account setup didn't finish</h2>
        <p className="text-muted-foreground max-w-md">{provisioningError}</p>
        <div className="flex gap-2">
          <Button onClick={() => void retryProvisioning()}>Retry</Button>
          <Button variant="outline" onClick={() => void signOut()}>Sign out</Button>
        </div>
      </div>
    );
  }

  // 4) Signed in, profile still loading (with finite retries)
  if (profileLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Setting up your account...</span>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default SupabaseAuthGuard;


import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const demoAccounts = [
    { role: 'Admin', email: 'admin@distillery.com', password: 'password123' },
    { role: 'Production', email: 'production@distillery.com', password: 'password123' },
    { role: 'Accounting', email: 'accounting@distillery.com', password: 'password123' },
  ];

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (error) {
      let message = 'Failed to sign in';
      if (error instanceof Error) {
        message = error.message;
      }
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-booze-cream to-booze-amber/20 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-xl bg-booze-amber flex items-center justify-center text-white text-2xl font-bold mb-4">BC</div>
          <h1 className="text-3xl font-bold text-booze-navy">Booze Cruiser</h1>
          <p className="text-muted-foreground mt-2">Compliance made simple for alcohol producers</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="mt-8">
          <h3 className="text-center text-sm font-medium text-muted-foreground mb-3">Demo Accounts</h3>
          <div className="grid gap-2">
            {demoAccounts.map((account) => (
              <Button
                key={account.email}
                variant="outline"
                className="w-full"
                onClick={() => fillDemoCredentials(account.email, account.password)}
              >
                Use {account.role} Account
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

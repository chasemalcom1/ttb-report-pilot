
import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from '@/components/ui/sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'production' | 'accounting';
  organization: {
    id: string;
    name: string;
    type: 'distillery' | 'winery' | 'brewery';
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Mock data for demonstration purposes
const MOCK_USERS = [
  {
    id: '1',
    name: 'John Distiller',
    email: 'admin@distillery.com',
    password: 'password123',
    role: 'admin' as const,
    organization: {
      id: '1',
      name: 'Mountain Spirits Distillery',
      type: 'distillery' as const,
    },
  },
  {
    id: '2',
    name: 'Sarah Production',
    email: 'production@distillery.com',
    password: 'password123',
    role: 'production' as const,
    organization: {
      id: '1',
      name: 'Mountain Spirits Distillery',
      type: 'distillery' as const,
    },
  },
  {
    id: '3',
    name: 'Mike Accounting',
    email: 'accounting@distillery.com',
    password: 'password123',
    role: 'accounting' as const,
    organization: {
      id: '1',
      name: 'Mountain Spirits Distillery',
      type: 'distillery' as const,
    },
  },
];

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on initial render
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const foundUser = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );
    
    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      toast.success(`Welcome back, ${userWithoutPassword.name}!`);
      return;
    }
    
    throw new Error('Invalid email or password');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

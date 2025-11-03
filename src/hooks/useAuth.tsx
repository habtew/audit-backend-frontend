import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react'; 
import { User, AuthResponse, LoginCredentials, RegisterData } from '../types';
import { apiClient } from '../utils/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData: User = await apiClient.getUserProfile();
          setUser(userData);
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      const response: AuthResponse = await apiClient.login(credentials);

      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken || "");
      setUser(response.user);

      toast.success('Login successful!');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      const response: AuthResponse = await apiClient.register(data);

      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken || "");
      setUser(response.user);

      toast.success('Registration successful!');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token');

      const response: { token: string } = await apiClient.refreshToken(refreshToken);
      localStorage.setItem('token', response.token);
    } catch (error) {
      logout();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    refreshToken,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


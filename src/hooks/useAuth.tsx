// src/hooks/useAuth.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react'; 
import { User, LoginCredentials, RegisterData } from '../types';
import { apiClient } from '../utils/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
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
          // Assuming profile response is also wrapped in { data: ... }
          const response = await apiClient.getUserProfile();
          // If API returns { data: User }, use response.data
          setUser(response.data); 
        } catch (error) {
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      const response = await apiClient.login(credentials);

      // FIX: Access token from nested data object based on your screenshot
      const token = response.data.access_token;
      const userData = response.data.user;

      if (token) {
        localStorage.setItem('token', token);
        setUser(userData);
        toast.success('Login successful!');
      } else {
        throw new Error('No access token received');
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error?.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      const response = await apiClient.register(data);
      
      // Assuming register response matches login response structure
      const token = response.data.access_token;
      const userData = response.data.user;

      if (token) {
        localStorage.setItem('token', token);
        setUser(userData);
        toast.success('Registration successful!');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
    window.location.href = '/login';
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
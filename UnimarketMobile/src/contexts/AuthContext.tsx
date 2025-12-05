import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, AuthResponse, RegisterData } from '../types';
import { authService } from '../services/supabase';
import { MESSAGES } from '../constants';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { nombre?: string; telefono?: string; direccion?: string }) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    checkAuthState();
    
    // Subscribe to auth state changes
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAuthState = async () => {
    try {
      setIsLoading(true);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error checking auth state:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login(email, password);
      setUser(response.user);
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = MESSAGES.serverError;
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Credenciales inválidas. Por favor verifica tu email y contraseña.';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Por favor confirma tu email antes de iniciar sesión.';
      } else if (error.code === 'PGRST116') {
        errorMessage = 'Usuario no encontrado. Por favor regístrate primero.';
      }
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      
      // Validate Univalle email
      if (!data.email.endsWith('@correounivalle.edu.co')) {
        throw new Error('Por favor usa tu email institucional de Univalle (@correounivalle.edu.co)');
      }
      
      const response = await authService.register(data);
      setUser(response.user);
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = MESSAGES.serverError;
      
      if (error.message?.includes('User already registered')) {
        errorMessage = 'Este email ya está registrado. Por favor inicia sesión.';
      } else if (error.message?.includes('duplicate key value')) {
        errorMessage = 'Este carnet ya está registrado.';
      } else if (error.message?.includes('invalid email')) {
        errorMessage = 'Email inválido. Por favor verifica tu email institucional.';
      }
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Error al cerrar sesión. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: { nombre?: string; telefono?: string; direccion?: string }) => {
    try {
      setIsLoading(true);
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
    } catch (error) {
      console.error('Profile update error:', error);
      throw new Error('Error al actualizar el perfil. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      
      // Validate Univalle email
      if (!email.endsWith('@correounivalle.edu.co')) {
        throw new Error('Por favor usa tu email institucional de Univalle (@correounivalle.edu.co)');
      }
      
      await authService.resetPassword(email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      let errorMessage = MESSAGES.serverError;
      
      if (error.message?.includes('User not found')) {
        errorMessage = 'Usuario no encontrado. Por favor verifica tu email.';
      }
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
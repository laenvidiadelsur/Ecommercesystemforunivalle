import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '../utils/supabase/client';
import { authAPI } from '../utils/api';
import type { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  accessToken: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: any) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session check error:', error);
        setLoading(false);
        return;
      }

      if (session?.access_token) {
        setAccessToken(session.access_token);
        await loadProfile(session.access_token);
      }
    } catch (error) {
      console.error('Check session error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadProfile(token: string) {
    try {
      // Try Edge Function first, fallback to direct Supabase
      try {
        const profile = await authAPI.getProfile(token);
        setUser(profile);
      } catch (edgeError) {
        // Fallback to direct Supabase call
        console.warn('Edge Function unavailable, using direct Supabase:', edgeError);
        const { directAuthAPI } = await import('../utils/supabase/direct');
        const profile = await directAuthAPI.getProfile();
        setUser(profile);
      }
    } catch (error) {
      console.error('Load profile error:', error);
      // If profile loading fails, clear auth
      setUser(null);
      setAccessToken(null);
    }
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Handle email not confirmed error
      if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
        throw new Error('Por favor confirma tu email antes de iniciar sesión. Revisa tu bandeja de entrada.');
      }
      throw new Error(error.message);
    }

    if (data.session?.access_token) {
      setAccessToken(data.session.access_token);
      await loadProfile(data.session.access_token);
    } else {
      // Session might be null if email confirmation is required
      throw new Error('Por favor confirma tu email antes de iniciar sesión.');
    }
  }

  async function signUp(signupData: any) {
    try {
      await authAPI.signup(signupData);
      // After signup, sign in automatically
      await signIn(signupData.email, signupData.password);
    } catch (error: any) {
      // If signup fails, try direct Supabase
      if (error.message.includes('conexión') || error.message.includes('no disponible')) {
        console.warn('Using direct Supabase signup');
        const { directAuthAPI } = await import('../utils/supabase/direct');
        await directAuthAPI.signup(signupData);
        // After direct signup, sign in
        await signIn(signupData.email, signupData.password);
      } else {
        throw error;
      }
    }
  }

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      // Siempre limpiar el estado local
      setUser(null);
      setAccessToken(null);
    }
  }

  async function refreshProfile() {
    if (accessToken) {
      await loadProfile(accessToken);
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      accessToken, 
      loading, 
      signIn, 
      signUp, 
      signOut,
      refreshProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

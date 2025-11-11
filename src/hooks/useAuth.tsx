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
      const profile = await authAPI.getProfile(token);
      setUser(profile);
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
      throw new Error(error.message);
    }

    if (data.session?.access_token) {
      setAccessToken(data.session.access_token);
      await loadProfile(data.session.access_token);
    }
  }

  async function signUp(signupData: any) {
    await authAPI.signup(signupData);
    // After signup, sign in automatically
    await signIn(signupData.email, signupData.password);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setAccessToken(null);
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

'use client';

import { createContext, useContext } from 'react';
import { User } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUser = {
  id: 'docker-user',
  email: 'docker@local',
  aud: 'authenticated',
  role: 'authenticated',
  created_at: new Date().toISOString(),
} as User;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const signIn = async (email: string, password: string) => {
    return {};
  };

  const signOut = async () => {
    return;
  };

  return (
    <AuthContext.Provider value={{ user: mockUser, loading: false, signIn, signOut }}>
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

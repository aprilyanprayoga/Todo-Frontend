import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { PublicUser } from '../types/api';
import * as authService from '../services/auth';

interface AuthContextValue {
  user: PublicUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  const reloadUser = useCallback(async () => {
    if (!localStorage.getItem('access_token')) {
      setUser(null);
      return;
    }
    try {
      setUser(await authService.getCurrentUser());
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (localStorage.getItem('access_token')) {
        try {
          const current = await authService.getCurrentUser();
          if (alive) setUser(current);
        } catch {
          if (alive) setUser(null);
        }
      }
      if (alive) setLoading(false);
    })();
    const expired = () => setUser(null);
    window.addEventListener('auth:session-expired', expired);
    return () => {
      alive = false;
      window.removeEventListener('auth:session-expired', expired);
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await authService.login(email, password);
    setUser(result.user);
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    const result = await authService.register(email, password, displayName);
    if (result.session) {
      setUser(result.user);
      return true;
    }
    return false;
  }, []);

  const signOut = useCallback(async () => {
    try { await authService.logout(); } finally { setUser(null); }
  }, []);

  const value = useMemo(
    () => ({ user, loading, signIn, signUp, signOut, reloadUser }),
    [user, loading, signIn, signUp, signOut, reloadUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth harus digunakan di dalam AuthProvider.');
  return value;
}

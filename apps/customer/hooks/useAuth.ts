'use client';

import { useState, useEffect, useContext, createContext } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, UserRole } from '@nrn/shared';

interface AuthState {
  user: FirebaseUser | null;
  profile: User | null;
  loading: boolean;
  error: string | null;
}

export interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function useRequireRole(requiredRole: UserRole) {
  const authCtx = useAuth();
  const isAuthorized = authCtx.profile?.role === requiredRole;
  return { ...authCtx, isAuthorized };
}

export function buildAuthState() {
  const [state, setState] = useState<AuthState>({ user: null, profile: null, loading: true, error: null });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setState({ user: null, profile: null, loading: false, error: null });
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
        const profile = snap.exists() ? (snap.data() as User) : null;
        setState({ user: firebaseUser, profile, loading: false, error: null });
      } catch {
        setState({ user: firebaseUser, profile: null, loading: false, error: null });
      }
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setState((s) => ({ ...s, loading: false, error: msg }));
      throw err;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return { ...state, login, logout };
}

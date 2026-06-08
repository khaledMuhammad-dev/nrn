'use client';

import { AuthContext, buildAuthState } from '@/hooks/useAuth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const value = buildAuthState();
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

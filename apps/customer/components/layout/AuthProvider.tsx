'use client';

import { useRef, useEffect } from 'react';
import { AuthContext, buildAuthState } from '@/hooks/useAuth';
import { useSplash } from '@/components/shared/SplashContext';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const value = buildAuthState();
  const { triggerSplash } = useSplash();
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (value.loading) return;

    if (!value.user) {
      // Reset so the next login can trigger the splash again
      hasTriggered.current = false;
      return;
    }

    if (!hasTriggered.current) {
      hasTriggered.current = true;
      triggerSplash();
    }
  }, [value.loading, value.user, triggerSplash]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

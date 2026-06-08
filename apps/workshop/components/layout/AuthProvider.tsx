'use client';

import { useRef, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useSplash } from '@/components/shared/SplashContext';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { triggerSplash } = useSplash();
  const hasTriggered = useRef(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        hasTriggered.current = false;
        return;
      }
      if (!hasTriggered.current) {
        hasTriggered.current = true;
        triggerSplash();
      }
    });
    return unsub;
  }, [triggerSplash]);

  return <>{children}</>;
}

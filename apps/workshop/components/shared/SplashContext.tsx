'use client';

import { createContext, useCallback, useContext, useRef, useState, ReactNode } from 'react';

interface SplashContextValue {
  splashKey: number;
  splashDone: boolean;
  triggerSplash: () => void;
  setSplashDone: (v: boolean) => void;
  logoRef: React.RefObject<HTMLDivElement>;
}

const SplashContext = createContext<SplashContextValue>({} as SplashContextValue);

export function SplashProvider({ children }: { children: ReactNode }) {
  const [splashKey, setSplashKey] = useState(0);
  const [splashDone, setSplashDone] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);

  const triggerSplash = useCallback(() => {
    setSplashDone(false);
    setSplashKey((k) => k + 1);
  }, []);

  return (
    <SplashContext.Provider value={{ splashKey, splashDone, triggerSplash, setSplashDone, logoRef }}>
      {children}
    </SplashContext.Provider>
  );
}

export function useSplash() {
  return useContext(SplashContext);
}

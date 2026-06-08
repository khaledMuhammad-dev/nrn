'use client';

import dynamic from 'next/dynamic';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from './AuthProvider';
import '@/lib/i18n';

// ssr: false ensures the splash always mounts fresh on the client so Framer
// Motion plays the entrance animation on every page load, including hard refresh.
const SplashScreen = dynamic(
  () => import('@/components/shared/SplashScreen').then((m) => m.SplashScreen),
  { ssr: false },
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <AuthProvider>
            <SplashScreen />
          {children}
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from './AuthProvider';
import { SplashScreen } from '@/components/shared/SplashScreen';
import '@/lib/i18n';

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

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useIdleTimer } from '@/hooks/useIdleTimer';
import { IdleModal } from '@/components/shared/IdleModal';
import { UserRole } from '@nrn/shared';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole: UserRole;
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const router = useRouter();
  const { user, profile, loading, logout } = useAuth();
  const { showIdleModal, dismissIdleModal } = useIdleTimer(() => {
    logout().then(() => router.push('/login'));
  });

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push('/login'); return; }
    if (profile && profile.role !== requiredRole) { router.push('/unauthorized'); return; }
  }, [user, profile, loading, requiredRole, router]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Skeleton className="h-32 w-64" /></div>;
  }

  if (!user || (profile && profile.role !== requiredRole)) return null;

  return (
    <>
      {children}
      <IdleModal show={showIdleModal} onDismiss={dismissIdleModal} onLogout={() => logout().then(() => router.push('/login'))} />
    </>
  );
}

'use client';

import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRole } from '@nrn/shared';
import { User } from 'lucide-react';

export default function ProfilePage() {
  const { profile } = useAuth();
  const { t } = useTranslation();

  return (
    <AuthGuard requiredRole={UserRole.CUSTOMER}>
      <div className="flex min-h-screen flex-col" style={{ maxWidth: 390, margin: '0 auto' }}>
        <Header />
        <main className="flex-1 overflow-y-auto p-4 pb-20">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" /> {t('profile.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <div><span className="font-medium">{t('profile.name')}: </span>{profile?.displayName}</div>
              <div><span className="font-medium">{t('profile.email')}: </span>{profile?.email}</div>
              <div><span className="font-medium">{t('profile.role')}: </span>{profile?.role}</div>
            </CardContent>
          </Card>
        </main>
        <BottomNav />
      </div>
    </AuthGuard>
  );
}

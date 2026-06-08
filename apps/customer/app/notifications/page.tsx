'use client';

import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserRole } from '@nrn/shared';
import { formatDateTime } from '@nrn/shared';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
  const { profile } = useAuth();
  const { notifications, markRead, markAllRead } = useNotifications(profile?.id);
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'en' | 'ar';

  return (
    <AuthGuard requiredRole={UserRole.CUSTOMER}>
      <div className="flex min-h-screen flex-col" style={{ maxWidth: 390, margin: '0 auto' }}>
        <Header />
        <main className="flex-1 overflow-y-auto p-4 pb-20">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-bold">{t('notifications.title')}</h1>
            <Button variant="ghost" size="sm" onClick={markAllRead}>
              {t('notifications.markAllRead')}
            </Button>
          </div>
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Bell className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">{t('notifications.empty')}</p>
            </div>
          ) : (
            notifications.map((n) => (
              <Card
                key={n.id}
                className={cn('mb-3 cursor-pointer p-4', !n.read && 'border-blue-200 bg-blue-50 dark:bg-blue-950/20')}
                onClick={() => markRead(n.id)}
              >
                {!n.read && <div className="mb-2 h-2 w-2 rounded-full bg-blue-500" />}
                <p className="font-medium">{lang === 'ar' ? n.titleAr : n.title}</p>
                <p className="text-sm text-muted-foreground">{lang === 'ar' ? n.bodyAr : n.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(n.createdAt)}</p>
              </Card>
            ))
          )}
        </main>
        <BottomNav />
      </div>
    </AuthGuard>
  );
}

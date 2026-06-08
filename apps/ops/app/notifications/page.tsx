'use client';
import { OpsLayout } from '@/components/layout/OpsLayout';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { Card } from '@/components/ui/card';
import { Bell } from 'lucide-react';
import { formatDateTime } from '@nrn/shared';
import { cn } from '@/lib/utils';
export default function OpsNotificationsPage() {
  const { profile } = useAuth();
  const { notifications, markRead } = useNotifications(profile?.id);
  return (
    <OpsLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Bell className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No notifications</p>
          </div>
        ) : notifications.map((n) => (
          <Card key={n.id} className={cn('cursor-pointer p-4', !n.read && 'border-blue-200 bg-blue-50 dark:bg-blue-950/20')} onClick={() => markRead(n.id)}>
            <p className="font-medium">{n.title}</p>
            <p className="text-sm text-muted-foreground">{n.body}</p>
            <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(n.createdAt)}</p>
          </Card>
        ))}
      </div>
    </OpsLayout>
  );
}

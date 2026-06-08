'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDateTime, toDate } from '@nrn/shared';
import { cn } from '@/lib/utils';

interface NotificationPanelProps {
  userId: string;
  lang?: 'en' | 'ar';
}

export function NotificationBell({ userId, lang = 'en' }: NotificationPanelProps) {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(userId);
  const [open, setOpen] = require('react').useState(false);

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={() => setOpen((o: boolean) => !o)} className="relative">
        <motion.div
          animate={unreadCount > 0 ? { rotate: [0, 15, -15, 10, -10, 0] } : {}}
          transition={{ duration: 0.5, repeat: unreadCount > 0 ? Infinity : 0, repeatDelay: 5 }}
        >
          <Bell className="h-5 w-5" />
        </motion.div>
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </Button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: lang === 'ar' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: lang === 'ar' ? -20 : 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={cn(
                'absolute top-12 z-50 w-80 rounded-xl border bg-background shadow-xl',
                lang === 'ar' ? 'left-0' : 'right-0'
              )}
            >
              <div className="flex items-center justify-between border-b p-4">
                <h3 className="font-semibold">Notifications</h3>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllRead}>
                      <Check className="mr-1 h-3 w-3" /> Mark all read
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-6 text-center text-sm text-muted-foreground">No notifications yet</p>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={cn(
                        'w-full border-b px-4 py-3 text-left text-sm hover:bg-muted transition-colors',
                        !n.read && 'bg-blue-50 dark:bg-blue-950/20'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {!n.read && <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
                        <div className={!n.read ? '' : 'pl-4'}>
                          <p className="font-medium">{lang === 'ar' ? n.titleAr : n.title}</p>
                          <p className="text-muted-foreground">{lang === 'ar' ? n.bodyAr : n.body}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatDateTime(n.createdAt, lang)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

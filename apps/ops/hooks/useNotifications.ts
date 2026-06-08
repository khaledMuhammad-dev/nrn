'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Notification } from '@nrn/shared';

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const items = snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as Notification))
          .sort((a, b) => {
            const ts = (v: unknown) =>
              v && typeof v === 'object' && 'seconds' in (v as object)
                ? (v as { seconds: number }).seconds
                : 0;
            return ts(b.createdAt) - ts(a.createdAt);
          });
        setNotifications(items);
        setUnreadCount(items.filter((n) => !n.read).length);
      },
      () => {},
    );
    return unsub;
  }, [userId]);

  const markRead = async (notificationId: string) => {
    await updateDoc(doc(db, 'notifications', notificationId), { read: true });
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    await Promise.all(unread.map((n) => updateDoc(doc(db, 'notifications', n.id), { read: true })));
  };

  return { notifications, unreadCount, markRead, markAllRead };
}

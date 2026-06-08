'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navItems = [
    { href: '/orders',        icon: Briefcase, label: t('nav.orders') },
    { href: '/notifications', icon: Bell,      label: t('nav.notifications') },
    { href: '/profile',       icon: User,      label: t('nav.profile') },
  ];

  return (
    <nav className="sticky bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t bg-background">
      {navItems.map(({ href, icon: Icon, label }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex min-w-[44px] flex-col items-center justify-center gap-0.5 py-2 text-[10px] transition-colors',
              active ? 'text-[var(--brand-primary)]' : 'text-muted-foreground'
            )}
          >
            <Icon className={cn('h-5 w-5', active && 'text-[var(--brand-primary)]')} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

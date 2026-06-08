'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, FileText, CheckSquare, Clock, AlertTriangle, Network, Globe, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard',     icon: LayoutDashboard, key: 'dashboard' },
  { href: '/cases',         icon: FileText,        key: 'cases' },
  { href: '/approvals',     icon: CheckSquare,     key: 'approvals' },
  { href: '/sla',           icon: Clock,           key: 'sla' },
  { href: '/escalations',   icon: AlertTriangle,   key: 'escalations' },
  { href: '/network',       icon: Network,         key: 'network' },
  { href: '/integrations',  icon: Globe,           key: 'integrations' },
  { href: '/notifications', icon: Bell,            key: 'notifications' },
  { href: '/profile',       icon: User,            key: 'profile' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r bg-background">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <div className="h-6 w-1 rounded-full bg-[var(--brand-accent)]" />
        <span className="font-bold text-[var(--brand-primary)] dark:text-white">{t('app.name')}</span>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-2">
        {navItems.map(({ href, icon: Icon, key }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                active ? 'bg-[var(--brand-primary)] text-white' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {t(`nav.${key}`)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

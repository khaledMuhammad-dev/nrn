'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, CheckSquare, Clock, AlertTriangle, Network, Globe, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/cases',        icon: FileText,        label: 'Cases' },
  { href: '/approvals',    icon: CheckSquare,     label: 'Approvals' },
  { href: '/sla',          icon: Clock,           label: 'SLA Board' },
  { href: '/escalations',  icon: AlertTriangle,   label: 'Escalations' },
  { href: '/network',      icon: Network,         label: 'Network' },
  { href: '/integrations', icon: Globe,           label: 'Integrations' },
  { href: '/notifications', icon: Bell,           label: 'Notifications' },
  { href: '/profile',      icon: User,            label: 'Profile' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r bg-background">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <div className="h-6 w-1 rounded-full bg-[var(--brand-accent)]" />
        <span className="font-bold text-[var(--brand-primary)] dark:text-white">NRN Ops</span>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-2">
        {navItems.map(({ href, icon: Icon, label }) => {
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
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

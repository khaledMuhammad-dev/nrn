'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, User, Settings, Calendar, BookOpen, Users, TrendingUp, Boxes, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/bookings',     icon: BookOpen,        label: 'Bookings' },
  { href: '/slots',        icon: Calendar,        label: 'Slots' },
  { href: '/schedule',     icon: Clock,           label: 'Schedule' },
  { href: '/capacity',     icon: Boxes,           label: 'Capacity' },
  { href: '/team',         icon: Users,           label: 'Team' },
  { href: '/performance',  icon: TrendingUp,      label: 'Performance' },
  { href: '/profile',      icon: User,            label: 'Profile' },
  { href: '/settings',     icon: Settings,        label: 'Settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r bg-background">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <div className="h-6 w-1 rounded-full bg-[var(--brand-accent)]" />
        <span className="font-bold text-[var(--brand-primary)] dark:text-white">Admin Panel</span>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                active
                  ? 'bg-[var(--brand-primary)] text-white'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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

'use client';

import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import { NotificationBell } from './NotificationPanel';
import { HeaderIconButton } from '@/components/shared/HeaderIconButton';
import { AnimatedHeaderIcon } from '@/components/shared/AnimatedHeaderIcon';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  appName?: string;
}

export function Header({ appName = 'NRN' }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { i18n } = useTranslation();
  const { profile, logout } = useAuth();

  const toggleLang = () => {
    const next = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(next);
    document.documentElement.setAttribute('lang', next);
    document.documentElement.setAttribute('dir', next === 'ar' ? 'rtl' : 'ltr');
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="h-6 w-1 rounded-full bg-[var(--brand-accent)]" />
        <span className="font-bold text-[var(--brand-primary)] dark:text-white">{appName}</span>
      </div>

      <div className="flex items-center gap-1">
        {profile && <NotificationBell userId={profile.id} lang={i18n.language as 'en' | 'ar'} />}

        <HeaderIconButton onClick={toggleLang} title="Toggle language">
          <AnimatedHeaderIcon variant="globe" size={16} />
        </HeaderIconButton>

        <HeaderIconButton
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title="Toggle theme"
        >
          <AnimatedHeaderIcon variant={theme === 'dark' ? 'sun' : 'moon'} size={16} />
        </HeaderIconButton>

        {profile && (
          <HeaderIconButton
            onClick={logout}
            title="Log out"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <AnimatedHeaderIcon variant="logout" size={16} className="rtl:scale-x-[-1]" />
          </HeaderIconButton>
        )}
      </div>
    </header>
  );
}

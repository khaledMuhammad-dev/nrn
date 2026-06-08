'use client';

import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, Globe, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationBell } from './NotificationPanel';
import { NrnLogo } from '@/components/shared/NrnLogo';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const { theme, setTheme } = useTheme();
  const { i18n } = useTranslation();
  const { user, profile, logout } = useAuth();

  const toggleLang = () => {
    const next = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(next);
    document.documentElement.setAttribute('lang', next);
    document.documentElement.setAttribute('dir', next === 'ar' ? 'rtl' : 'ltr');
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4 shadow-sm">
      <div className="flex items-center gap-2">
        <NrnLogo size={28} />
      </div>

      <div className="flex items-center gap-1">
        {profile && <NotificationBell userId={profile.id} lang={i18n.language as 'en' | 'ar'} />}

        <Button variant="ghost" size="icon" onClick={toggleLang} title="Toggle language">
          <Globe className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title="Toggle theme">
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {user && (
          <Button variant="ghost" size="icon" onClick={logout} title="Log out">
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </div>
    </header>
  );
}

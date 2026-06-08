import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { UserRole } from '@nrn/shared';

export default function AccidentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole={UserRole.CUSTOMER}>
      <div className="flex min-h-screen flex-col" style={{ maxWidth: 390, margin: '0 auto' }}>
        <Header appName="NRN Customer" />
        <main className="flex-1 overflow-y-auto pb-20">{children}</main>
        <BottomNav />
      </div>
    </AuthGuard>
  );
}

import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { UserRole } from '@nrn/shared';

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole={UserRole.OWNER}>
      <div className="flex min-h-screen flex-col">
        <Header appName="NRN Admin" />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}

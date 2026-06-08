import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { AuthGuard } from './AuthGuard';
import { UserRole } from '@nrn/shared';

export function OpsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole={UserRole.OPERATOR}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}

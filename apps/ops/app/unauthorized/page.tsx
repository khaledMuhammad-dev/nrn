'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { ShieldX } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <ShieldX className="h-16 w-16 text-red-400" />
      <h1 className="text-2xl font-bold">Unauthorized</h1>
      <p className="text-muted-foreground">You don&apos;t have permission to access this page.</p>
      <p className="text-sm text-muted-foreground">Make sure you are using the correct account for this app.</p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.push('/login')}>Return to Login</Button>
        <Button variant="destructive" onClick={handleSignOut}>Sign Out</Button>
      </div>
    </div>
  );
}

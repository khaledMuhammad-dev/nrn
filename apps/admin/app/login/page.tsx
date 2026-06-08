'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const schema = z.object({ email: z.string().email(), password: z.string().min(6) });
type FormData = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, loading, error, user } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });
  useEffect(() => {
    if (!loading && user) router.push('/dashboard');
  }, [user, loading, router]);
  const onSubmit = async (data: FormData) => { try { await login(data.email, data.password); } catch {} };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[var(--brand-primary)] to-blue-900 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--brand-accent)]">
            <span className="text-2xl font-black text-white">NRN</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Workshop Admin Panel</h1>
        </div>
        <Card>
          <CardHeader><CardTitle>Sign In</CardTitle><CardDescription>Owner/Manager access</CardDescription></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Email</Label>
                <Input type="email" placeholder="owner@nrn.demo" {...register('email')} />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Password</Label>
                <Input type="password" placeholder="••••••••" {...register('password')} />
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              </div>
              {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">Invalid credentials</p>}
              <Button type="submit" disabled={loading} size="lg" variant="brand">{loading ? 'Signing in…' : 'Sign In'}</Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

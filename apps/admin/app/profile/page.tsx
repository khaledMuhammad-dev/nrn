'use client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
export default function AdminProfilePage() {
  const { profile } = useAuth();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Profile</h1>
      <Card className="max-w-md">
        <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-4 w-4" /> Account</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <div><span className="font-medium">Name: </span>{profile?.displayName}</div>
          <div><span className="font-medium">Email: </span>{profile?.email}</div>
          <div><span className="font-medium">Role: </span>{profile?.role}</div>
          <div><span className="font-medium">Workshop: </span>{profile?.workshopId}</div>
        </CardContent>
      </Card>
    </div>
  );
}

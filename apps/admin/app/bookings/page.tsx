'use client';

import { useAuth } from '@/hooks/useAuth';
import { useCases } from '@/hooks/useCase';
import { StatusBadge } from '@/components/case/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CaseStatus } from '@nrn/shared';
import { formatDate } from '@nrn/shared';
import { BookOpen, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';

export default function BookingsPage() {
  const { profile } = useAuth();
  const { cases, loading } = useCases(profile?.workshopId ?? undefined);
  const pending = cases.filter((c) => c.status === CaseStatus.ASSIGNMENT_PENDING);
  const scheduled = cases.filter((c) => c.status === CaseStatus.APPOINTMENT_SCHEDULED);

  const handleAccept = async (id: string) => {
    try {
      await api.post(`/cases/${id}/accept`);
      toast.success('Booking accepted');
    } catch { toast.error('Failed'); }
  };

  const handleReject = async (id: string) => {
    try {
      await api.post(`/cases/${id}/reject`, { reason: 'Workshop at capacity' });
      toast.info('Booking rejected');
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Bookings</h1>

      {pending.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><BookOpen className="h-4 w-4" /> Incoming ({pending.length})</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3">
            {pending.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-semibold">{c.vehicle.make} {c.vehicle.model} — {c.vehicle.plate}</p>
                  <p className="text-sm text-muted-foreground">Ref: {c.accidentRef}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="destructive" onClick={() => handleReject(c.id)}><XCircle className="mr-1 h-3 w-3" />Decline</Button>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleAccept(c.id)}><CheckCircle className="mr-1 h-3 w-3" />Accept</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Scheduled ({scheduled.length})</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3">
          {scheduled.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-semibold">{c.vehicle.make} {c.vehicle.model} — {c.vehicle.plate}</p>
                <p className="text-sm text-muted-foreground">{formatDate(c.createdAt)}</p>
              </div>
              <StatusBadge status={c.status as CaseStatus} />
            </div>
          ))}
          {scheduled.length === 0 && <p className="text-muted-foreground">No scheduled bookings</p>}
        </CardContent>
      </Card>
    </div>
  );
}

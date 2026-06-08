'use client';
import { OpsLayout } from '@/components/layout/OpsLayout';
import { useCases } from '@/hooks/useCase';
import { StatusBadge } from '@/components/case/StatusBadge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CaseStatus } from '@nrn/shared';
import { AlertTriangle } from 'lucide-react';
export default function EscalationsPage() {
  const { cases } = useCases();
  const escalated = cases.filter((c) => c.slaTimers?.some((t) => t.status === 'breached'));
  return (
    <OpsLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Escalation Queue</h1>
        {escalated.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <AlertTriangle className="h-12 w-12 text-green-400" />
            <p className="text-muted-foreground">No escalations — all cases are within SLA</p>
          </div>
        ) : (
          escalated.map((c) => (
            <Card key={c.id} className="p-4 border-red-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold">{c.vehicle.plate} — {c.vehicle.make} {c.vehicle.model}</p>
                  <StatusBadge status={c.status as CaseStatus} className="mt-1" />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Reassign</Button>
                  <Button size="sm" variant="destructive">Dismiss</Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </OpsLayout>
  );
}

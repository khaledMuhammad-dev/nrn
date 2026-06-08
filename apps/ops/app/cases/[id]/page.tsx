'use client';

import React from 'react';
import { OpsLayout } from '@/components/layout/OpsLayout';
import { useCase } from '@/hooks/useCase';
import { StatusBadge } from '@/components/case/StatusBadge';
import { CaseTimeline } from '@/components/case/CaseTimeline';
import { SlaTimerBadge } from '@/components/case/SlaTimer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CaseStatus } from '@nrn/shared';
import { formatDateTime } from '@nrn/shared';
import { ArrowLeft, Car, Clock, FileText, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/axios';

export default function CaseDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router  = useRouter();
  const { caseData, loading } = useCase(id);

  if (loading) return <OpsLayout><Skeleton className="h-64 w-full" /></OpsLayout>;
  if (!caseData) return <OpsLayout><p className="text-center">Case not found</p></OpsLayout>;

  const status = caseData.status as CaseStatus;

  return (
    <OpsLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/cases')}><ArrowLeft className="h-5 w-5 rtl:rotate-180" /></Button>
          <h1 className="text-2xl font-bold">Case {id}</h1>
          <StatusBadge status={status} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Vehicle */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Car className="h-4 w-4" /> Vehicle</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted-foreground">Make: </span>{caseData.vehicle.make}</div>
              <div><span className="text-muted-foreground">Model: </span>{caseData.vehicle.model}</div>
              <div><span className="text-muted-foreground">Year: </span>{caseData.vehicle.year}</div>
              <div><span className="text-muted-foreground">Plate: </span><strong>{caseData.vehicle.plate}</strong></div>
              <div><span className="text-muted-foreground">Ref: </span><span className="font-mono text-xs">{caseData.accidentRef}</span></div>
            </CardContent>
          </Card>

          {/* SLA Timers */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Clock className="h-4 w-4" /> SLA Timers</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-2">
              {caseData.slaTimers?.length > 0 ? (
                caseData.slaTimers.map((t, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span>{t.stage}</span>
                    <SlaTimerBadge timer={t} />
                  </div>
                ))
              ) : <p className="text-muted-foreground">No SLA timers</p>}
            </CardContent>
          </Card>

          {/* Audit Log */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><FileText className="h-4 w-4" /> Audit Log</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-col divide-y">
                {caseData.auditLog?.map((entry, idx) => (
                  <div key={idx} className="flex items-start justify-between py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={entry.status} className="text-xs" />
                      <span className="text-muted-foreground">by {entry.actorRole} ({entry.actorId.slice(0, 6)}…)</span>
                      {entry.reason && <span className="text-xs text-amber-600">· {entry.reason}</span>}
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDateTime(entry.timestamp)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Case Timeline</CardTitle></CardHeader>
            <CardContent><CaseTimeline caseData={caseData} /></CardContent>
          </Card>
        </div>
      </div>
    </OpsLayout>
  );
}

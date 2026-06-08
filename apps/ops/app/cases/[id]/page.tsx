'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, query, where, documentId, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
import { ArrowLeft, Car, Clock, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CaseDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router  = useRouter();
  const { t }   = useTranslation();
  const { caseData, loading } = useCase(id);
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!caseData?.auditLog?.length) return;

    const ids = [...new Set(
      caseData.auditLog
        .map((e) => e.actorId)
        .filter((id) => id && id !== 'system')
    )];
    if (!ids.length) return;

    const batches: Promise<void>[] = [];
    for (let i = 0; i < ids.length; i += 10) {
      const chunk = ids.slice(i, i + 10);
      batches.push(
        getDocs(query(collection(db, 'users'), where(documentId(), 'in', chunk)))
          .then((snap) => {
            setUserNames((prev) => {
              const next = { ...prev };
              snap.docs.forEach((d) => {
                next[d.id] = (d.data().displayName as string) || t('cases.unknownUser');
              });
              return next;
            });
          })
      );
    }
    Promise.all(batches);
  }, [caseData?.auditLog, t]);

  const resolveActor = (actorId: string) => {
    if (actorId === 'system') return t('cases.system');
    return userNames[actorId] ?? t('cases.unknownUser');
  };

  if (loading) return <OpsLayout><Skeleton className="h-64 w-full" /></OpsLayout>;
  if (!caseData) return <OpsLayout><p className="text-center">{t('cases.notFound')}</p></OpsLayout>;

  const status = caseData.status as CaseStatus;

  return (
    <OpsLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/cases')}>
            <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
          </Button>
          <h1 className="text-2xl font-bold">{t('cases.caseId')} {id}</h1>
          <StatusBadge status={status} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Vehicle */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Car className="h-4 w-4" /> {t('cases.vehicle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted-foreground">{t('cases.make')}: </span>{caseData.vehicle.make}</div>
              <div><span className="text-muted-foreground">{t('cases.model')}: </span>{caseData.vehicle.model}</div>
              <div><span className="text-muted-foreground">{t('cases.year')}: </span>{caseData.vehicle.year}</div>
              <div><span className="text-muted-foreground">{t('cases.plate')}: </span><strong>{caseData.vehicle.plate}</strong></div>
              <div><span className="text-muted-foreground">{t('cases.ref')}: </span><span className="font-mono text-xs">{caseData.accidentRef}</span></div>
            </CardContent>
          </Card>

          {/* SLA Timers */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" /> {t('cases.slaPanel')}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {caseData.slaTimers?.length > 0 ? (
                caseData.slaTimers.map((timer, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span>{timer.stage}</span>
                    <SlaTimerBadge timer={timer} />
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">{t('cases.noSlaTimers')}</p>
              )}
            </CardContent>
          </Card>

          {/* Audit Log */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" /> {t('cases.auditLog')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col divide-y">
                {[...(caseData.auditLog ?? [])].reverse().map((entry, idx) => (
                  <div key={idx} className="flex items-start justify-between py-2 text-sm">
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={entry.status} className="text-xs" />
                      <span className="text-muted-foreground">
                        {t('cases.by')} {resolveActor(entry.actorId)}
                      </span>
                      {entry.reason && (
                        <span className="text-xs text-amber-600">· {entry.reason}</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 ms-2">
                      {formatDateTime(entry.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('cases.timeline')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CaseTimeline caseData={caseData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </OpsLayout>
  );
}

'use client';

import { OpsLayout } from '@/components/layout/OpsLayout';
import { useCases } from '@/hooks/useCase';
import { SlaTimerBadge } from '@/components/case/SlaTimer';
import { StatusBadge } from '@/components/case/StatusBadge';
import { Card } from '@/components/ui/card';
import { CaseStatus } from '@nrn/shared';
import { motion } from 'framer-motion';

export default function SlaPage() {
  const { cases } = useCases();

  const onTrack  = cases.filter((c) => !c.slaTimers?.some((t) => t.status !== 'on_track') && c.slaTimers?.length > 0);
  const atRisk   = cases.filter((c) => c.slaTimers?.some((t) => t.status === 'at_risk') && !c.slaTimers?.some((t) => t.status === 'breached'));
  const breached = cases.filter((c) => c.slaTimers?.some((t) => t.status === 'breached'));
  const noSla    = cases.filter((c) => !c.slaTimers?.length && ![CaseStatus.CLOSED, CaseStatus.CANCELLED].includes(c.status as CaseStatus));

  const columns = [
    { title: 'On Track',  cases: [...onTrack, ...noSla], color: 'border-green-200 bg-green-50 dark:bg-green-950/20' },
    { title: 'At Risk',   cases: atRisk,                 color: 'border-amber-200 bg-amber-50 dark:bg-amber-950/20' },
    { title: 'Breached',  cases: breached,               color: 'border-red-200 bg-red-50 dark:bg-red-950/20' },
  ];

  return (
    <OpsLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">SLA Board</h1>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {columns.map(({ title, cases: colCases, color }) => (
            <div key={title} className="flex flex-col gap-3">
              <div className={`rounded-lg border p-3 ${color}`}>
                <h2 className="font-bold">{title} <span className="text-muted-foreground font-normal">({colCases.length})</span></h2>
              </div>
              {colCases.map((c, idx) => {
                const timer = c.slaTimers?.[c.slaTimers.length - 1];
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-mono text-xs font-medium">{c.id.slice(0, 8)}</p>
                          <p className="text-sm">{c.vehicle.plate} — {c.vehicle.make} {c.vehicle.model}</p>
                          <StatusBadge status={c.status as CaseStatus} className="mt-1 text-xs" />
                        </div>
                        {timer && <SlaTimerBadge timer={timer} />}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
              {colCases.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">None</p>}
            </div>
          ))}
        </div>
      </div>
    </OpsLayout>
  );
}

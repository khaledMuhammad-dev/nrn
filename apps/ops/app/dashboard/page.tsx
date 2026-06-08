'use client';

import { useTranslation } from 'react-i18next';
import { OpsLayout } from '@/components/layout/OpsLayout';
import { useCases } from '@/hooks/useCase';
import { StatusBadge } from '@/components/case/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CaseStatus } from '@nrn/shared';
import { formatDateTime } from '@nrn/shared';
import { motion } from 'framer-motion';
import { FileText, CheckSquare, AlertTriangle, Network } from 'lucide-react';

export default function OpsDashboardPage() {
  const { t } = useTranslation();
  const { cases, loading } = useCases();

  const activeCount   = cases.filter((c) => ![CaseStatus.CLOSED, CaseStatus.CANCELLED].includes(c.status as CaseStatus)).length;
  const pendingCount  = cases.filter((c) => [CaseStatus.ESTIMATE_PENDING, CaseStatus.INVOICE_PENDING].includes(c.status as CaseStatus)).length;
  const breachedCount = cases.filter((c) => c.slaTimers?.some((t) => t.status === 'breached')).length;
  const recentActivity = cases
    .flatMap((c) => c.auditLog?.map((a) => ({ ...a, caseId: c.id, vehicle: c.vehicle })) ?? [])
    .sort((a, b) => {
      const ta = new Date(a.timestamp as string).getTime();
      const tb = new Date(b.timestamp as string).getTime();
      return tb - ta;
    })
    .slice(0, 10);

  const kpis = [
    { label: t('dashboard.activeCases'),    value: activeCount,   icon: FileText,      color: 'text-blue-600' },
    { label: t('dashboard.pendingApprovals'), value: pendingCount, icon: CheckSquare,  color: 'text-amber-600' },
    { label: t('dashboard.slaBreaches'),    value: breachedCount, icon: AlertTriangle, color: 'text-red-600' },
    { label: t('dashboard.networkSize'),    value: 1,             icon: Network,       color: 'text-green-600' },
  ];

  return (
    <OpsLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpis.map(({ label, value, icon: Icon, color }, idx) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
              <Card>
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <Icon className={`mb-2 h-8 w-8 ${color}`} />
                  <p className="text-3xl font-bold">{value}</p>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Status Breakdown */}
        <Card>
          <CardHeader><CardTitle className="text-base">{t('dashboard.casesByStatus')}</CardTitle></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-24" /> : (
              <div className="flex flex-wrap gap-3">
                {Object.values(CaseStatus).map((status) => {
                  const count = cases.filter((c) => c.status === status).length;
                  if (count === 0) return null;
                  return (
                    <div key={status} className="flex items-center gap-2">
                      <StatusBadge status={status} />
                      <span className="text-sm font-bold">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader><CardTitle className="text-base">{t('dashboard.recentActivity')}</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col divide-y">
              {recentActivity.map((entry, idx) => (
                <div key={idx} className="flex items-start justify-between py-2.5 text-sm">
                  <div>
                    <span className="font-medium">{entry.vehicle?.plate ?? entry.caseId}</span>
                    <span className="mx-1 text-muted-foreground">→</span>
                    <StatusBadge status={entry.status} className="text-xs" />
                    <span className="ml-2 text-xs text-muted-foreground">by {entry.actorRole}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDateTime(entry.timestamp)}</span>
                </div>
              ))}
              {recentActivity.length === 0 && <p className="py-4 text-center text-muted-foreground">No activity yet</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </OpsLayout>
  );
}

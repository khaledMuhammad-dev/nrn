'use client';

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCases } from '@/hooks/useCase';
import { StatusBadge } from '@/components/case/StatusBadge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CaseStatus } from '@nrn/shared';
import { formatDate, toDate } from '@nrn/shared';
import { Car, ChevronRight, AlertTriangle } from 'lucide-react';

export default function AccidentsPage() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { profile, loading: authLoading } = useAuth();
  const { cases, loading: casesLoading } = useCases(profile?.id);
  const lang = i18n.language as 'en' | 'ar';

  const loading = authLoading || casesLoading;

  if (loading) {
    return (
      <div className="flex flex-col gap-3 p-4">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <h1 className="text-xl font-bold">{t('accidents.title')}</h1>

      {cases.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Car className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">{t('accidents.empty')}</p>
        </div>
      ) : (
        cases.map((c, idx) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
          >
            <Card
              className="cursor-pointer p-4 hover:shadow-md transition-shadow"
              onClick={() => {
                if (c.status === CaseStatus.WORKSHOP_SELECTION) {
                  router.push(`/accidents/${c.id}/workshops`);
                } else {
                  router.push(`/accidents/${c.id}`);
                }
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">
                      {c.vehicle.make} {c.vehicle.model} {c.vehicle.year}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {c.vehicle.plate} · Ref: {c.accidentRef}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDate(c.createdAt, lang)}
                  </p>
                  <div className="mt-2">
                    <StatusBadge status={c.status as CaseStatus} lang={lang} />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  {c.status === CaseStatus.WORKSHOP_SELECTION && (
                    <Button
                      size="sm"
                      variant="accent"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/accidents/${c.id}/workshops`);
                      }}
                    >
                      {t('accidents.findWorkshops')}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCases } from '@/hooks/useCase';
import { StatusBadge } from '@/components/case/StatusBadge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CaseStatus } from '@nrn/shared';
import { formatDate, toDate } from '@nrn/shared';
import { Car, ChevronRight, Plus, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';

export default function AccidentsPage() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { profile, loading: authLoading } = useAuth();
  const { cases, loading: casesLoading } = useCases(profile?.id);
  const lang = i18n.language as 'en' | 'ar';
  const [showStartOver, setShowStartOver] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [addingAccident, setAddingAccident] = useState(false);

  const loading = authLoading || casesLoading;

  const handleAddAccident = async () => {
    if (!profile?.id) return;
    setAddingAccident(true);
    try {
      const res = await api.post('/cases', { customerId: profile.id });
      toast.success(t('accidents.addSuccess'));
      router.push(`/accidents/${res.data.caseId}/workshops`);
    } catch {
      toast.error(t('accidents.addFailed'));
    } finally {
      setAddingAccident(false);
    }
  };

  const handleStartOver = async () => {
    setResetting(true);
    try {
      await api.post('/seed');
      toast.success(t('actions.startOverSuccess'));
      setShowStartOver(false);
    } catch {
      toast.error(t('actions.startOverFailed'));
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-3 p-4">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t('accidents.title')}</h1>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleAddAccident}
            disabled={addingAccident}
            className="gap-1.5"
          >
            <Plus className={`h-3.5 w-3.5 ${addingAccident ? 'animate-spin' : ''}`} />
            {addingAccident ? '…' : t('accidents.addAccident')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowStartOver(true)}
            className="gap-1.5 text-muted-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {t('actions.startOver')}
          </Button>
        </div>
      </div>

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
                    {c.vehicle.plate} · {t('accidents.ref')}: {c.accidentRef}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDate(c.createdAt, lang)}
                  </p>
                  <div className="mt-2">
                    <StatusBadge status={c.status as CaseStatus} lang={lang} />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <ChevronRight className="h-5 w-5 text-muted-foreground rtl:rotate-180" />
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

      {/* Start Over Dialog */}
      <Dialog open={showStartOver} onOpenChange={setShowStartOver}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('actions.startOverConfirm')}</DialogTitle>
            <DialogDescription>{t('actions.startOverDesc')}</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowStartOver(false)} className="flex-1">
              {t('actions.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleStartOver}
              disabled={resetting}
              className="flex-1 gap-2"
            >
              <RotateCcw className={`h-4 w-4 ${resetting ? 'animate-spin' : ''}`} />
              {resetting ? '…' : t('actions.startOverConfirm')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

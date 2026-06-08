'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useCase } from '@/hooks/useCase';
import { StatusBadge } from '@/components/case/StatusBadge';
import { CaseTimeline } from '@/components/case/CaseTimeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { CaseStatus } from '@nrn/shared';
import { Car, Star, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';

export default function CaseDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router  = useRouter();
  const { t, i18n } = useTranslation();
  const { caseData, loading } = useCase(id);
  const lang = i18n.language as 'en' | 'ar';
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [rating, setRating] = useState(0);

  if (loading) return <div className="p-4"><Skeleton className="h-64 w-full" /></div>;
  if (!caseData) return <div className="p-4 text-center">{t('case.notFound')}</div>;

  const status = caseData.status as CaseStatus;
  const canCancel = [CaseStatus.ASSIGNMENT_PENDING, CaseStatus.APPOINTMENT_SCHEDULED].includes(status);

  const CANCEL_REASONS = [
    { value: 'mistake',   label: t('case.cancelReasons.mistake') },
    { value: 'other_ws',  label: t('case.cancelReasons.other_ws') },
    { value: 'long_wait', label: t('case.cancelReasons.long_wait') },
    { value: 'other',     label: t('case.cancelReasons.other') },
  ];

  const handleCancel = async () => {
    if (!cancelReason) return;
    setCancelling(true);
    try {
      await api.post(`/cases/${id}/cancel`, { reason: cancelReason });
      toast.success(t('case.cancelSuccess'));
      setShowCancel(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('case.cancelFailed'));
    } finally {
      setCancelling(false);
    }
  };

  const handleRate = async (stars: number) => {
    setRating(stars);
    try {
      await api.post(`/cases/${id}/rate`, { rating: stars });
      toast.success(t('case.rateSuccess'));
    } catch {
      toast.error(t('case.rateFailed'));
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.push('/accidents')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">{t('case.title', { id: id.slice(0, 8) })}</h1>
      </div>

      {/* Status */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <StatusBadge status={status} lang={lang} />
          <span className="font-mono text-xs text-muted-foreground">{caseData.accidentRef}</span>
        </div>
      </Card>

      {/* Vehicle */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Car className="h-4 w-4" /> {t('case.vehicle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-muted-foreground">{t('case.make')}: </span>{caseData.vehicle.make}</div>
          <div><span className="text-muted-foreground">{t('case.model')}: </span>{caseData.vehicle.model}</div>
          <div><span className="text-muted-foreground">{t('case.year')}: </span>{caseData.vehicle.year}</div>
          <div><span className="text-muted-foreground">{t('case.plate')}: </span>{caseData.vehicle.plate}</div>
          <div className="col-span-2"><span className="text-muted-foreground">{t('case.color')}: </span>{caseData.vehicle.color}</div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('case.timeline')}</CardTitle>
        </CardHeader>
        <CardContent>
          <CaseTimeline caseData={caseData} lang={lang} />
        </CardContent>
      </Card>

      {/* Rate Workshop */}
      {status === CaseStatus.CLOSED && (
        <Card className="p-4">
          <h3 className="mb-3 font-semibold">{t('case.rate')}</h3>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRate(star)}
                className="text-2xl transition-transform hover:scale-110"
              >
                <Star className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Cancel Button */}
      {canCancel && (
        <Button variant="destructive" onClick={() => setShowCancel(true)}>
          {t('case.cancel')}
        </Button>
      )}

      {/* Cancel Dialog */}
      <Dialog open={showCancel} onOpenChange={setShowCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('case.cancel')}</DialogTitle>
            <DialogDescription>{t('case.cancelDialogDesc')}</DialogDescription>
          </DialogHeader>
          <Select onValueChange={setCancelReason}>
            <SelectTrigger>
              <SelectValue placeholder={t('case.selectReason')} />
            </SelectTrigger>
            <SelectContent>
              {CANCEL_REASONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCancel(false)} className="flex-1">
              {t('actions.back')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={!cancelReason || cancelling}
              className="flex-1"
            >
              {cancelling ? t('case.cancelling') : t('actions.confirm')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

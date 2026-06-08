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
import { formatDateTime, toDate } from '@nrn/shared';
import { Car, MapPin, Calendar, Star, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';

const CANCEL_REASONS = [
  { value: 'mistake',   label: 'Booked by mistake' },
  { value: 'other_ws',  label: 'Found another workshop' },
  { value: 'long_wait', label: 'Long wait time' },
  { value: 'other',     label: 'Other' },
];

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
  if (!caseData) return <div className="p-4 text-center">Case not found</div>;

  const status = caseData.status as CaseStatus;
  const canCancel = [CaseStatus.ASSIGNMENT_PENDING, CaseStatus.APPOINTMENT_SCHEDULED].includes(status);

  const handleCancel = async () => {
    if (!cancelReason) return;
    setCancelling(true);
    try {
      await api.post(`/cases/${id}/cancel`, { reason: cancelReason });
      toast.success('Booking cancelled');
      setShowCancel(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to cancel');
    } finally {
      setCancelling(false);
    }
  };

  const handleRate = async (stars: number) => {
    setRating(stars);
    try {
      await api.post(`/cases/${id}/rate`, { rating: stars });
      toast.success('Thank you for your rating!');
    } catch {
      toast.error('Failed to submit rating');
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.push('/accidents')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">Case {id}</h1>
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
          <div><span className="text-muted-foreground">Make: </span>{caseData.vehicle.make}</div>
          <div><span className="text-muted-foreground">Model: </span>{caseData.vehicle.model}</div>
          <div><span className="text-muted-foreground">Year: </span>{caseData.vehicle.year}</div>
          <div><span className="text-muted-foreground">Plate: </span>{caseData.vehicle.plate}</div>
          <div className="col-span-2"><span className="text-muted-foreground">Color: </span>{caseData.vehicle.color}</div>
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
            <DialogDescription>Please tell us why you&apos;re cancelling</DialogDescription>
          </DialogHeader>
          <Select onValueChange={setCancelReason}>
            <SelectTrigger>
              <SelectValue placeholder="Select a reason" />
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
              {cancelling ? 'Cancelling…' : t('actions.confirm')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

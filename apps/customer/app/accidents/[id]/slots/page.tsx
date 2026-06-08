'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Slot } from '@nrn/shared';
import { ArrowLeft, Clock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import api from '@/lib/axios';

export default function SlotsPage({ params }: { params: { id: string } }) {
  const { id }      = params;
  const router      = useRouter();
  const searchParams = useSearchParams();
  const workshopId  = searchParams.get('workshopId');
  const { t, i18n } = useTranslation();
  const lang        = i18n.language;
  const [slots, setSlots]       = useState<Slot[]>([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [booking, setBooking]   = useState(false);

  useEffect(() => {
    if (!workshopId) return;
    api.get(`/workshops/${workshopId}/slots`)
      .then((r) => setSlots(r.data.data ?? []))
      .finally(() => setLoading(false));
  }, [workshopId]);

  const grouped = slots.reduce<Record<string, Slot[]>>((acc, s) => {
    acc[s.date] = [...(acc[s.date] ?? []), s];
    return acc;
  }, {});

  const handleBook = async () => {
    if (!selected || !workshopId) return;
    setBooking(true);
    try {
      await api.post(`/cases/${id}/book`, { slotId: selected, workshopId });
      toast.success(t('slots.confirm'));
      router.push(`/accidents/${id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('actions.cancel'));
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
        </Button>
        <h1 className="text-lg font-bold">{t('slots.title')}</h1>
      </div>

      {loading ? (
        [1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
      ) : (
        Object.entries(grouped).map(([date, daySlots]) => (
          <div key={date}>
            <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
              {new Date(date).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
                weekday: 'long', month: 'short', day: 'numeric',
              })}
            </h2>
            <div className="flex flex-col gap-2">
              {daySlots.map((slot) => {
                const isFull = slot.bookedCount >= slot.capacity;
                const isSelected = selected === slot.id;
                return (
                  <motion.button
                    key={slot.id}
                    onClick={() => !isFull && setSelected(slot.id)}
                    whileTap={{ scale: 0.97 }}
                    className={cn(
                      'flex items-center justify-between rounded-lg border p-3 text-left transition-colors',
                      isFull    && 'cursor-not-allowed opacity-50',
                      isSelected && 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/10',
                      !isFull && !isSelected && 'hover:border-[var(--brand-primary)]/50'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{slot.timeWindow}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isFull ? (
                        <span className="text-xs text-red-500">{t('slots.full')}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {t('slots.left', { count: slot.capacity - slot.bookedCount })}
                        </span>
                      )}
                      {isSelected && <CheckCircle className="h-4 w-4 text-[var(--brand-primary)]" />}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))
      )}

      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky bottom-0 bg-background pb-2 pt-4"
        >
          <Button
            size="xl"
            variant="brand"
            onClick={handleBook}
            disabled={booking}
            className="w-full"
          >
            {booking ? t('slots.booking') : t('slots.confirm')}
          </Button>
        </motion.div>
      )}
    </div>
  );
}

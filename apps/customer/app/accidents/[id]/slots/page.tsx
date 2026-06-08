'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Slot } from '@nrn/shared';
import { ArrowLeft, Clock, CheckCircle, CalendarX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import api from '@/lib/axios';

export default function SlotsPage({ params }: { params: { id: string } }) {
  const { id }       = params;
  const router       = useRouter();
  const searchParams = useSearchParams();
  const workshopId   = searchParams.get('workshopId');
  const { t, i18n }  = useTranslation();
  const locale       = i18n.language === 'ar' ? 'ar-SA' : 'en-US';
  const [slots, setSlots]               = useState<Slot[]>([]);
  const [loading, setLoading]           = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [booking, setBooking]           = useState(false);

  useEffect(() => {
    if (!workshopId) return;
    api.get(`/workshops/${workshopId}/slots`)
      .then((r) => setSlots(r.data.data ?? []))
      .finally(() => setLoading(false));
  }, [workshopId]);

  const grouped = useMemo(() => {
    return slots.reduce<Record<string, Slot[]>>((acc, s) => {
      acc[s.date] = [...(acc[s.date] ?? []), s];
      return acc;
    }, {});
  }, [slots]);

  const dates = useMemo(() => Object.keys(grouped).sort(), [grouped]);

  const dayHasOpening = (date: string) =>
    (grouped[date] ?? []).some((s) => s.bookedCount < s.capacity);

  // Auto-select the first date that still has an opening.
  useEffect(() => {
    if (selectedDate || dates.length === 0) return;
    setSelectedDate(dates.find(dayHasOpening) ?? dates[0]);
  }, [dates]); // eslint-disable-line react-hooks/exhaustive-deps

  const pickDate = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleBook = async () => {
    if (!selectedSlot || !workshopId) return;
    setBooking(true);
    try {
      await api.post(`/cases/${id}/book`, { slotId: selectedSlot, workshopId });
      toast.success(t('slots.confirm'));
      router.push(`/accidents/${id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('actions.cancel'));
    } finally {
      setBooking(false);
    }
  };

  const daySlots = selectedDate ? (grouped[selectedDate] ?? []) : [];

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
        </Button>
        <h1 className="text-lg font-bold">{t('slots.title')}</h1>
      </div>

      {loading ? (
        <>
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </>
      ) : dates.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center text-muted-foreground">
          <CalendarX className="h-10 w-10" />
          <p>{t('slots.empty')}</p>
        </div>
      ) : (
        <>
          {/* Date strip */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-4 px-4 pb-1">
            {dates.map((date) => {
              const d        = new Date(`${date}T00:00:00`);
              const open     = dayHasOpening(date);
              const isActive = selectedDate === date;
              return (
                <motion.button
                  key={date}
                  onClick={() => open && pickDate(date)}
                  whileTap={open ? { scale: 0.95 } : undefined}
                  className={cn(
                    'flex shrink-0 flex-col items-center gap-0.5 rounded-xl border px-3.5 py-2 transition-colors',
                    !open && 'cursor-not-allowed opacity-40',
                    isActive && 'border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white',
                    open && !isActive && 'hover:border-[var(--brand-primary)]/50',
                  )}
                >
                  <span className="text-[11px] font-medium uppercase opacity-80">
                    {d.toLocaleDateString(locale, { weekday: 'short' })}
                  </span>
                  <span className="text-lg font-bold leading-none">
                    {d.toLocaleDateString(locale, { day: 'numeric' })}
                  </span>
                  <span className="text-[10px] opacity-70">
                    {d.toLocaleDateString(locale, { month: 'short' })}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Time chips for the selected day */}
          <div>
            <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
              {t('slots.availableTimes')}
            </h2>
            <motion.div
              key={selectedDate}
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.04 } } }}
              className="grid grid-cols-2 gap-2"
            >
              {daySlots.map((slot) => {
                const isFull     = slot.bookedCount >= slot.capacity;
                const isSelected = selectedSlot === slot.id;
                return (
                  <motion.button
                    key={slot.id}
                    variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                    onClick={() => !isFull && setSelectedSlot(slot.id)}
                    whileTap={!isFull ? { scale: 0.97 } : undefined}
                    className={cn(
                      'flex flex-col gap-1 rounded-lg border p-3 text-left transition-colors',
                      isFull && 'cursor-not-allowed opacity-50',
                      isSelected && 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/10',
                      !isFull && !isSelected && 'hover:border-[var(--brand-primary)]/50',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium">{slot.timeWindow}</span>
                      </div>
                      {isSelected && (
                        <CheckCircle className="h-4 w-4 text-[var(--brand-primary)]" />
                      )}
                    </div>
                    <span className={cn('text-xs', isFull ? 'text-red-500' : 'text-muted-foreground')}>
                      {isFull ? t('slots.full') : t('slots.left', { count: slot.capacity - slot.bookedCount })}
                    </span>
                  </motion.button>
                );
              })}
            </motion.div>
          </div>
        </>
      )}

      {selectedSlot && (
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

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Workshop } from '@nrn/shared';
import { Star, MapPin, ArrowLeft, ShieldCheck, CalendarCheck } from 'lucide-react';
import api from '@/lib/axios';

export default function WorkshopDetailPage({ params }: { params: { id: string; workshopId: string } }) {
  const { id, workshopId } = params;
  const router = useRouter();
  const { t } = useTranslation();
  const [workshop, setWorkshop]     = useState<Workshop | null>(null);
  const [totalSlots, setTotalSlots] = useState<number | null>(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/workshops/${workshopId}`),
      api.get(`/workshops/${workshopId}/slots`),
    ])
      .then(([workshopRes, slotsRes]) => {
        setWorkshop(workshopRes.data.data);
        const slots: { capacity: number; bookedCount: number }[] = slotsRes.data.data ?? [];
        setTotalSlots(slots.reduce((sum, s) => sum + Math.max(0, s.capacity - s.bookedCount), 0));
      })
      .finally(() => setLoading(false));
  }, [workshopId]);

  if (loading) return <div className="p-4"><Skeleton className="h-64 w-full" /></div>;
  if (!workshop) return <div className="p-4 text-center">Workshop not found</div>;

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
        </Button>
        <h1 className="text-lg font-bold">{workshop.name}</h1>
      </div>

      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{workshop.name}</h2>
                <ShieldCheck className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-sm text-muted-foreground">{workshop.nameAr}</p>
              <div className="mt-1 flex items-center gap-1 text-yellow-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="font-semibold">{workshop.rating.toFixed(1)}</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <CalendarCheck className="h-4 w-4 text-[var(--brand-primary)]" />
                {totalSlots === null
                  ? <Skeleton className="h-4 w-24" />
                  : totalSlots === 0
                    ? <span className="text-muted-foreground">{t('workshops.noSlots')}</span>
                    : <span className="font-medium text-[var(--brand-primary)]">
                        {t('workshops.slotsAvailable', { count: totalSlots })}
                      </span>
                }
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{workshop.location.address}</span>
          </div>
        </Card>
      </motion.div>

      {/* Map Embed */}
      <Card className="overflow-hidden">
        <iframe
          title="Workshop Location"
          width="100%"
          height="200"
          style={{ border: 0 }}
          loading="lazy"
          src={`https://maps.google.com/maps?q=${workshop.location.lat},${workshop.location.lng}&z=15&output=embed`}
        />
      </Card>

      {/* Services */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('workshops.services')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {workshop.services.map((s) => (
            <Badge key={s} variant="secondary" className="capitalize">{s}</Badge>
          ))}
        </CardContent>
      </Card>

      {/* Select Button */}
      <Button
        size="xl"
        variant="brand"
        onClick={() => router.push(`/accidents/${id}/slots?workshopId=${workshopId}`)}
        className="w-full"
      >
        {t('workshops.selectWorkshop')}
      </Button>
    </div>
  );
}

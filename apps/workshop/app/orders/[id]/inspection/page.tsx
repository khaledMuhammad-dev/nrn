'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { FileUpload } from '@/components/shared/FileUpload';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Camera } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';

export default function InspectionPage({ params }: { params: { id: string } }) {
  const { id }   = params;
  const router   = useRouter();
  const { t }    = useTranslation();

  const PHOTO_SLOTS = [
    t('order.angles.front'),
    t('order.angles.rear'),
    t('order.angles.driverSide'),
    t('order.angles.passengerSide'),
    t('order.angles.interior'),
    t('order.angles.roof'),
  ];

  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [notes, setNotes]   = useState('');
  const [submitting, setSubmitting] = useState(false);

  const hasMinPhoto = Object.keys(photos).length >= 1;

  const handleSubmit = async () => {
    if (!hasMinPhoto) return;
    setSubmitting(true);
    try {
      await api.post(`/cases/${id}/inspection`, {
        photos: PHOTO_SLOTS.map((s) => photos[s]).filter(Boolean),
        notes,
      });
      toast.success(t('order.submitSuccess'));
      router.push(`/orders/${id}/items`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('order.submitFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">{t('order.photos')}</h1>
      </div>

      <Card className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <Camera className="h-5 w-5" />
          <h2 className="font-semibold">{t('order.photosHint')}</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {PHOTO_SLOTS.map((slot) => (
            <FileUpload
              key={slot}
              path={`inspections/${id}`}
              accept="image/*"
              label={slot}
              preview={photos[slot]}
              onUploadComplete={(url) => setPhotos((prev) => ({ ...prev, [slot]: url }))}
              className="h-28"
            />
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="mb-3 font-semibold">{t('order.notes')}</h2>
        <Textarea
          placeholder={t('order.notesPlaceholder')}
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Card>

      <Button
        size="xl"
        variant="brand"
        className="w-full"
        disabled={!hasMinPhoto || submitting}
        onClick={handleSubmit}
      >
        {submitting
          ? t('order.submitting')
          : hasMinPhoto
            ? t('order.submitInspection')
            : t('order.photosHint')}
      </Button>
    </div>
  );
}

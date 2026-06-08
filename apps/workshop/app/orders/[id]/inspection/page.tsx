'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FileUpload } from '@/components/shared/FileUpload';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Camera } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';

export default function InspectionPage({ params }: { params: { id: string } }) {
  const { id }   = params;
  const router   = useRouter();
  const { t }    = useTranslation();

  const DRAFT_KEY = `inspection_draft_${id}`;

  const PHOTO_SLOTS = [
    { key: 'front',         label: t('order.angles.front') },
    { key: 'rear',          label: t('order.angles.rear') },
    { key: 'driverSide',    label: t('order.angles.driverSide') },
    { key: 'passengerSide', label: t('order.angles.passengerSide') },
    { key: 'interior',      label: t('order.angles.interior') },
    { key: 'roof',          label: t('order.angles.roof') },
  ];

  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [notes, setNotes]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(true);

  useEffect(() => {
    // Seed from localStorage immediately so the UI isn't blank while Firestore loads
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) setPhotos(JSON.parse(saved));
    } catch {}

    // Firestore submitted inspection wins over localStorage draft
    getDocs(query(collection(db, 'inspections'), where('caseId', '==', id)))
      .then((snap) => {
        if (!snap.empty) {
          const data = snap.docs[0].data();
          if (data.photosBySlot && Object.keys(data.photosBySlot).length > 0) {
            setPhotos(data.photosBySlot as Record<string, string>);
          } else if (Array.isArray(data.photos) && data.photos.length > 0) {
            const restored: Record<string, string> = {};
            (data.photos as string[]).forEach((url, i) => {
              if (PHOTO_SLOTS[i] && url) restored[PHOTO_SLOTS[i].key] = url;
            });
            setPhotos(restored);
          }
          if (data.notes) setNotes(data.notes as string);
        }
      })
      .finally(() => setLoadingDraft(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveDraft = (updated: Record<string, string>) => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(updated)); } catch {}
  };

  const handleUpload = (key: string, url: string) => {
    setPhotos((prev) => {
      const next = { ...prev, [key]: url };
      saveDraft(next);
      return next;
    });
  };

  const handleDelete = (key: string) => {
    setPhotos((prev) => {
      const next = { ...prev };
      delete next[key];
      saveDraft(next);
      return next;
    });
  };

  const hasMinPhoto = Object.keys(photos).length >= 1;

  const handleSubmit = async () => {
    if (!hasMinPhoto) return;
    setSubmitting(true);
    try {
      await api.post(`/cases/${id}/inspection`, {
        photos:       PHOTO_SLOTS.map((s) => photos[s.key]).filter(Boolean),
        photosBySlot: photos,
        notes,
      });
      try { localStorage.removeItem(DRAFT_KEY); } catch {}
      toast.success(t('order.submitSuccess'));
      router.push(`/orders/${id}/items`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('order.submitFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingDraft) return <div className="p-4"><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
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
              key={slot.key}
              path={`inspections/${id}`}
              accept="image/*"
              label={slot.label}
              preview={photos[slot.key]}
              onUploadComplete={(url) => handleUpload(slot.key, url)}
              onDelete={() => handleDelete(slot.key)}
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

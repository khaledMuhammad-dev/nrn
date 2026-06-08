'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileUpload } from '@/components/shared/FileUpload';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Camera } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';

const PHOTO_SLOTS = ['Front', 'Rear', 'Driver Side', 'Passenger Side', 'Interior', 'Roof'];

export default function InspectionPage({ params }: { params: { id: string } }) {
  const { id }   = params;
  const router   = useRouter();
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [notes, setNotes]   = useState('');
  const [submitting, setSubmitting] = useState(false);

  const allUploaded = PHOTO_SLOTS.every((slot) => photos[slot]);

  const handleSubmit = async () => {
    if (!allUploaded) return;
    setSubmitting(true);
    try {
      await api.post(`/cases/${id}/inspection`, {
        photos: PHOTO_SLOTS.map((s) => photos[s]),
        notes,
      });
      toast.success('Inspection submitted!');
      router.push(`/orders/${id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
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
        <h1 className="text-lg font-bold">Vehicle Inspection</h1>
      </div>

      <Card className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <Camera className="h-5 w-5" />
          <h2 className="font-semibold">6-Angle Photos</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {PHOTO_SLOTS.map((slot) => (
            <FileUpload
              key={slot}
              path={`inspections/${id}`}
              label={slot}
              preview={photos[slot]}
              onUploadComplete={(url) => setPhotos((prev) => ({ ...prev, [slot]: url }))}
              className="h-28"
            />
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="mb-3 font-semibold">Inspection Notes</h2>
        <Textarea
          placeholder="Describe the damage, visible issues, customer complaint..."
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Card>

      <Button
        size="xl"
        variant="brand"
        className="w-full"
        disabled={!allUploaded || submitting}
        onClick={handleSubmit}
      >
        {submitting ? 'Submitting…' : allUploaded ? 'Submit Inspection' : `Upload all 6 photos (${Object.keys(photos).length}/6)`}
      </Button>
    </div>
  );
}

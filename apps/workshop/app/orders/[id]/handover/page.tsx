'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useCase } from '@/hooks/useCase';
import { SignaturePad } from '@/components/shared/SignaturePad';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Truck } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';

export default function HandoverPage({ params }: { params: { id: string } }) {
  const { id }   = params;
  const router   = useRouter();
  const { t }    = useTranslation();
  const { caseData, loading } = useCase(id);
  const [saving, setSaving]   = useState(false);

  if (loading) return <div className="p-4"><Skeleton className="h-64 w-full" /></div>;

  const handleSignature = async (dataUrl: string) => {
    setSaving(true);
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const form = new FormData();
      form.append('file', blob, `handover_${Date.now()}.png`);
      form.append('path', `signatures/${id}/handover_${Date.now()}.png`);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: form });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadJson.error ?? 'Upload failed');
      const handoverSignatureUrl = uploadJson.data.url;
      await api.post(`/cases/${id}/deliver`, { handoverSignatureUrl });
      toast.success(t('order.handoverSaveSuccess'));
      router.push(`/orders/${id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('order.handoverSaveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
        </Button>
        <h1 className="text-lg font-bold">{t('order.handover')}</h1>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Truck className="h-4 w-4" /> {t('order.handoverSummary')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <p>{t('order.vehicle')}: {caseData?.vehicle.make} {caseData?.vehicle.model}</p>
          <p>{t('order.plate')}: {caseData?.vehicle.plate}</p>
        </CardContent>
      </Card>

      <Card className="p-4">
        <h2 className="mb-3 font-semibold">{t('order.signature')}</h2>
        <SignaturePad
          onSave={handleSignature}
          description={{
            en: `I, the undersigned, confirm that the vehicle (${caseData?.vehicle.make} ${caseData?.vehicle.model} — Plate: ${caseData?.vehicle.plate}) has been returned to me in satisfactory condition upon completion of all agreed repair works. I acknowledge that all services have been rendered as described.`,
            ar: `أنا الموقّع أدناه أؤكد استلام المركبة (${caseData?.vehicle.make} ${caseData?.vehicle.model} — اللوحة: ${caseData?.vehicle.plate}) في حالة مُرضية بعد إتمام جميع أعمال الإصلاح المتّفق عليها. أقرّ بأن جميع الخدمات قد نُفّذت على النحو المبيّن.`,
          }}
        />
        {saving && <p className="mt-2 text-center text-sm text-muted-foreground">{t('order.saving')}</p>}
      </Card>
    </div>
  );
}

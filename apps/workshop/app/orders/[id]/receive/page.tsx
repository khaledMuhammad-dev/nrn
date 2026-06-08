'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useCase } from '@/hooks/useCase';
import { SignaturePad } from '@/components/shared/SignaturePad';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Car } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';

export default function ReceiveCarPage({ params }: { params: { id: string } }) {
  const { id }   = params;
  const router   = useRouter();
  const { t }    = useTranslation();
  const { caseData, loading } = useCase(id);
  const [saving, setSaving]   = useState(false);

  if (loading) return <div className="p-4"><Skeleton className="h-64 w-full" /></div>;
  if (!caseData) return <div className="p-4 text-center">{t('order.notFound')}</div>;

  const handleSignature = async (dataUrl: string) => {
    setSaving(true);
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const form = new FormData();
      form.append('file', blob, `receive_${Date.now()}.png`);
      form.append('path', `signatures/${id}/receive_${Date.now()}.png`);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: form });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadJson.error ?? 'Upload failed');
      const signatureUrl = uploadJson.data.url;
      await api.post(`/cases/${id}/receive`, { signatureUrl });
      toast.success(t('order.saveSuccess'));
      router.push(`/orders/${id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('order.saveFailed'));
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
        <h1 className="text-lg font-bold">{t('order.receiveCar')}</h1>
      </div>

      {/* Accident Report */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Car className="h-4 w-4" /> {t('order.ref')} — Najm
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <div><span className="font-medium">{t('order.ref')}: </span>{caseData.accidentRef}</div>
          <div><span className="font-medium">{t('order.vehicle')}: </span>{caseData.vehicle.make} {caseData.vehicle.model} {caseData.vehicle.year}</div>
          <div><span className="font-medium">{t('order.plate')}: </span>{caseData.vehicle.plate}</div>
          <div><span className="font-medium">{t('order.vin')}: </span><span className="font-mono text-xs">{caseData.vehicle.vin}</span></div>
          <div><span className="font-medium">{t('order.color')}: </span>{caseData.vehicle.color}</div>
        </CardContent>
      </Card>

      {/* Signature */}
      <Card className="p-4">
        <h2 className="mb-3 font-semibold">{t('order.signature')}</h2>
        <SignaturePad
          onSave={handleSignature}
          description={{
            en: `I, the undersigned, confirm that I am handing over the above vehicle (Ref: ${caseData.accidentRef}) to Al-Faris Auto Center and that the details stated herein are accurate. I authorize the center to carry out the necessary inspection and repair works on my behalf.`,
            ar: `أنا الموقّع أدناه أقرّ بتسليم المركبة المذكورة أعلاه (المرجع: ${caseData.accidentRef}) إلى مركز الفارس للسيارات وأؤكد صحة البيانات الواردة في هذه الوثيقة. أفوّض المركز بإجراء أعمال الفحص والإصلاح اللازمة نيابةً عني.`,
          }}
        />
        {saving && <p className="mt-2 text-center text-sm text-muted-foreground">{t('order.saving')}</p>}
      </Card>
    </div>
  );
}

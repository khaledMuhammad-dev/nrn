'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCase } from '@/hooks/useCase';
import { SignaturePad } from '@/components/shared/SignaturePad';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { ArrowLeft, Truck } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';

export default function HandoverPage({ params }: { params: { id: string } }) {
  const { id }   = params;
  const router   = useRouter();
  const { caseData, loading } = useCase(id);
  const [saving, setSaving]   = useState(false);

  if (loading) return <div className="p-4"><Skeleton className="h-64 w-full" /></div>;

  const handleSignature = async (dataUrl: string) => {
    setSaving(true);
    try {
      const fileRef = storageRef(storage, `signatures/${id}/handover_${Date.now()}.png`);
      await uploadString(fileRef, dataUrl, 'data_url');
      const handoverSignatureUrl = await getDownloadURL(fileRef);
      await api.post(`/cases/${id}/deliver`, { handoverSignatureUrl });
      toast.success('Vehicle handed over!');
      router.push(`/orders/${id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">Vehicle Handover</h1>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Truck className="h-4 w-4" /> Handover Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <p>Vehicle: {caseData?.vehicle.make} {caseData?.vehicle.model}</p>
          <p>Plate: {caseData?.vehicle.plate}</p>
          <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
            By signing below, the customer confirms receipt of the repaired vehicle and acknowledges
            that all repairs have been performed to their satisfaction. All warranty terms and conditions apply.
            أقر المالك بصحة وسلامة المركبة عند الاستلام وأن الإصلاح قد تم كما هو مطلوب.
          </p>
        </CardContent>
      </Card>

      <Card className="p-4">
        <h2 className="mb-3 font-semibold">Customer Signature</h2>
        <SignaturePad onSave={handleSignature} />
        {saving && <p className="mt-2 text-center text-sm text-muted-foreground">Saving…</p>}
      </Card>
    </div>
  );
}

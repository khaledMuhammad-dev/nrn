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
import { ArrowLeft, Car } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';

export default function ReceiveCarPage({ params }: { params: { id: string } }) {
  const { id }   = params;
  const router   = useRouter();
  const { caseData, loading } = useCase(id);
  const [saving, setSaving]   = useState(false);

  if (loading) return <div className="p-4"><Skeleton className="h-64 w-full" /></div>;
  if (!caseData) return <div className="p-4 text-center">Order not found</div>;

  const handleSignature = async (dataUrl: string) => {
    setSaving(true);
    try {
      const fileRef = storageRef(storage, `signatures/${id}/receive_${Date.now()}.png`);
      await uploadString(fileRef, dataUrl, 'data_url');
      const signatureUrl = await getDownloadURL(fileRef);
      await api.post(`/cases/${id}/receive`, { signatureUrl });
      toast.success('Car received!');
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
        <h1 className="text-lg font-bold">Receive Car</h1>
      </div>

      {/* Accident Report */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Car className="h-4 w-4" /> Najm Accident Report
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <div><span className="font-medium">Reference: </span>{caseData.accidentRef}</div>
          <div><span className="font-medium">Vehicle: </span>{caseData.vehicle.make} {caseData.vehicle.model} {caseData.vehicle.year}</div>
          <div><span className="font-medium">Plate: </span>{caseData.vehicle.plate}</div>
          <div><span className="font-medium">VIN: </span><span className="font-mono text-xs">{caseData.vehicle.vin}</span></div>
          <div><span className="font-medium">Color: </span>{caseData.vehicle.color}</div>
        </CardContent>
      </Card>

      {/* Signature */}
      <Card className="p-4">
        <h2 className="mb-3 font-semibold">Customer Signature</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          By signing below, the customer confirms vehicle drop-off at the workshop.
        </p>
        <SignaturePad onSave={handleSignature} />
        {saving && <p className="mt-2 text-center text-sm text-muted-foreground">Uploading signature…</p>}
      </Card>
    </div>
  );
}

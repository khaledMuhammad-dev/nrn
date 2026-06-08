'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EstimateLineItem } from '@nrn/shared';
import { ArrowLeft, Send, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';

export default function ReviewPage({ params }: { params: { id: string } }) {
  const { id }   = params;
  const router   = useRouter();
  const [items, setItems]       = useState<EstimateLineItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(`estimate_items_${id}`);
    if (stored) setItems(JSON.parse(stored));
  }, [id]);

  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (items.length === 0) { toast.error('Add at least one item'); return; }
    setSubmitting(true);
    try {
      await api.post(`/cases/${id}/estimate`, { lineItems: items });
      sessionStorage.removeItem(`estimate_items_${id}`);
      toast.success('Estimate submitted to Najm!');
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
        <h1 className="text-lg font-bold">Review & Submit Estimate</h1>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Line Items</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {items.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground">No items added. Go back to add parts.</p>
          ) : (
            items.map((item, idx) => (
              <div key={idx} className="flex items-start justify-between gap-2 rounded-lg border p-3 text-sm">
                <div className="flex-1">
                  <p className="font-medium">{item.description}</p>
                  <p className="font-mono text-xs text-muted-foreground">{item.partNumber}</p>
                  <p className="text-muted-foreground">Qty: {item.quantity} × SAR {item.unitPrice.toLocaleString()}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <p className="font-semibold">SAR {(item.quantity * item.unitPrice).toLocaleString()}</p>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeItem(idx)}>
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {items.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-[var(--brand-accent)]">SAR {total.toLocaleString()}</span>
          </div>
        </Card>
      )}

      <Button
        size="xl"
        variant="brand"
        className="w-full"
        disabled={items.length === 0 || submitting}
        onClick={handleSubmit}
      >
        <Send className="mr-2 h-5 w-5" />
        {submitting ? 'Submitting…' : 'Submit Estimate to Najm'}
      </Button>
    </div>
  );
}

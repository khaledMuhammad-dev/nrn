'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EstimateLineItem } from '@nrn/shared';
import { ArrowLeft, Send, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';

export default function ReviewPage({ params }: { params: { id: string } }) {
  const { id }   = params;
  const router   = useRouter();
  const { t }    = useTranslation();
  const [items, setItems]           = useState<EstimateLineItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(`estimate_items_${id}`);
    if (stored) setItems(JSON.parse(stored));
  }, [id]);

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (items.length === 0) { toast.error(t('order.noItems')); return; }
    setSubmitting(true);
    try {
      await api.post(`/cases/${id}/estimate`, { lineItems: items });
      sessionStorage.removeItem(`estimate_items_${id}`);
      toast.success(t('order.estimateSuccess'));
      router.push(`/orders/${id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('order.estimateFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
        </Button>
        <h1 className="text-lg font-bold">{t('order.reviewSubmit')}</h1>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('order.estimateItems')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {items.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground">{t('order.noItems')}</p>
          ) : (
            items.map((item, idx) => (
              <div key={idx} className="flex items-start justify-between gap-2 rounded-lg border p-3 text-sm">
                <div className="flex-1">
                  <p className="font-medium">{item.description}</p>
                  <p className="font-mono text-xs text-muted-foreground">{item.partNumber}</p>
                  <p className="text-muted-foreground">× {item.quantity}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeItem(idx)}>
                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Button
        size="xl"
        variant="brand"
        className="w-full"
        disabled={items.length === 0 || submitting}
        onClick={handleSubmit}
      >
        <Send className="mr-2 h-5 w-5" />
        {submitting ? t('order.submitting') : t('order.submitEstimate')}
      </Button>
    </div>
  );
}

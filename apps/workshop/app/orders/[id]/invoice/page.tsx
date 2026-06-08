'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Send } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { EstimateLineItem } from '@nrn/shared';

export default function InvoicePage({ params }: { params: { id: string } }) {
  const { id }   = params;
  const router   = useRouter();
  const { t }    = useTranslation();
  const [items, setItems]           = useState<EstimateLineItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/cases/${id}`).then((r) => {
      const caseData = r.data.data;
      if (caseData?.estimate?.lineItems) {
        setItems(caseData.estimate.lineItems);
      }
    }).catch(() => {});
  }, [id]);

  const total = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post(`/cases/${id}/invoice`, { amount: total, lineItems: items });
      toast.success(t('order.invoiceSuccess'));
      router.push(`/orders/${id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('order.invoiceFailed'));
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
        <h1 className="text-lg font-bold">{t('order.invoiceTitle')}</h1>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" /> {t('order.invoiceItems')}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {items.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground">{t('order.noItems')}</p>
          ) : (
            items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                <div>
                  <p className="font-medium">{item.description}</p>
                  <p className="text-muted-foreground">× {item.quantity} · SAR {item.unitPrice.toLocaleString()}</p>
                </div>
                <p className="font-semibold">SAR {(item.quantity * item.unitPrice).toLocaleString()}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {items.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between text-lg font-bold">
            <span>{t('order.invoiceTotal')}</span>
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
        {submitting ? t('order.invoiceSubmitting') : t('order.submitInvoiceBtn')}
      </Button>
    </div>
  );
}

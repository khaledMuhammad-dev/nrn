'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { OpsLayout } from '@/components/layout/OpsLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, XCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';

interface Estimate {
  id: string; caseId: string; lineItems: Array<{ description: string; quantity: number; unitPrice: number }>; total: number;
}
interface Invoice {
  id: string; caseId: string; amount: number; lineItems: Array<{ description: string; quantity: number; unitPrice: number }>;
}

export default function ApprovalsPage() {
  const { t } = useTranslation();
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [invoices,  setInvoices]  = useState<Invoice[]>([]);
  const [loading, setLoading]     = useState(true);
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});

  useEffect(() => {
    let estReady = false;
    let invReady = false;
    const tryDone = () => { if (estReady && invReady) setLoading(false); };

    const estUnsub = onSnapshot(
      query(collection(db, 'estimates'), where('approvalStatus', '==', 'pending')),
      (snap) => {
        setEstimates(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Estimate)));
        estReady = true; tryDone();
      },
      () => { estReady = true; tryDone(); },
    );

    const invUnsub = onSnapshot(
      query(collection(db, 'invoices'), where('approvalStatus', '==', 'pending')),
      (snap) => {
        setInvoices(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Invoice)));
        invReady = true; tryDone();
      },
      () => { invReady = true; tryDone(); },
    );

    return () => { estUnsub(); invUnsub(); };
  }, []);

  const handleApproveEstimate = async (caseId: string) => {
    try {
      await api.post(`/cases/${caseId}/approve-estimate`);
      toast.success(t('approvals.approveSuccess'));
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : t('approvals.failed')); }
  };

  const handleRejectEstimate = async (caseId: string) => {
    const reason = rejectReasons[caseId];
    if (!reason) { toast.error(t('approvals.rejectPlaceholder')); return; }
    try {
      await api.post(`/cases/${caseId}/reject-estimate`, { reason });
      toast.info(t('approvals.rejectSuccess'));
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : t('approvals.failed')); }
  };

  const handleApproveInvoice = async (caseId: string) => {
    try {
      await api.post(`/cases/${caseId}/approve-invoice`);
      toast.success(t('approvals.approveSuccess'));
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : t('approvals.failed')); }
  };

  return (
    <OpsLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">{t('approvals.title')}</h1>

        <Tabs defaultValue="estimates">
          <TabsList>
            <TabsTrigger value="estimates">{t('approvals.estimates')} ({estimates.length})</TabsTrigger>
            <TabsTrigger value="invoices">{t('approvals.invoices')} ({invoices.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="estimates" className="flex flex-col gap-4 pt-4">
            {loading ? <Skeleton className="h-40" /> :
             estimates.length === 0 ? <p className="py-8 text-center text-muted-foreground">{t('approvals.noEstimates')}</p> :
             estimates.map((est) => (
              <motion.div key={est.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <FileText className="h-4 w-4" /> {t('approvals.caseRef')}: {est.caseId}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="py-1 text-left">{t('approvals.lineItems')}</th>
                          <th className="py-1 text-right">Qty</th>
                          <th className="py-1 text-right">Unit</th>
                          <th className="py-1 text-right">{t('approvals.total')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {est.lineItems.map((item, i) => (
                          <tr key={i} className="border-b last:border-0">
                            <td className="py-1">{item.description}</td>
                            <td className="py-1 text-right">{item.quantity}</td>
                            <td className="py-1 text-right">SAR {item.unitPrice.toLocaleString()}</td>
                            <td className="py-1 text-right font-medium">SAR {(item.quantity * item.unitPrice).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="flex items-center justify-between border-t pt-2">
                      <span className="text-lg font-bold">{t('approvals.total')}: SAR {est.total.toLocaleString()}</span>
                    </div>
                    <Input
                      placeholder={t('approvals.rejectPlaceholder')}
                      value={rejectReasons[est.caseId] ?? ''}
                      onChange={(e) => setRejectReasons((p) => ({ ...p, [est.caseId]: e.target.value }))}
                    />
                    <div className="flex gap-3">
                      <Button variant="destructive" className="flex-1" onClick={() => handleRejectEstimate(est.caseId)}>
                        <XCircle className="mr-2 h-4 w-4" /> {t('approvals.reject')}
                      </Button>
                      <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleApproveEstimate(est.caseId)}>
                        <CheckCircle className="mr-2 h-4 w-4" /> {t('approvals.approve')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="invoices" className="flex flex-col gap-4 pt-4">
            {loading ? <Skeleton className="h-40" /> :
             invoices.length === 0 ? <p className="py-8 text-center text-muted-foreground">{t('approvals.noInvoices')}</p> :
             invoices.map((inv) => (
              <motion.div key={inv.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{t('approvals.invoices')} — {t('approvals.caseRef')}: {inv.caseId}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <div className="text-2xl font-bold text-[var(--brand-accent)]">SAR {inv.amount.toLocaleString()}</div>
                    <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleApproveInvoice(inv.caseId)}>
                      <CheckCircle className="mr-2 h-4 w-4" /> {t('approvals.approve')}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </OpsLayout>
  );
}

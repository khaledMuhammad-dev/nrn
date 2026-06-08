'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useCase } from '@/hooks/useCase';
import { StatusBadge } from '@/components/case/StatusBadge';
import { SlaTimerBadge } from '@/components/case/SlaTimer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CaseStatus } from '@nrn/shared';
import { Car, ArrowLeft, Wrench, Camera, Package, CheckSquare, Truck, FileText, ClipboardCheck } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { useState } from 'react';

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router  = useRouter();
  const { t }   = useTranslation();
  const { caseData, loading } = useCase(id);
  const [starting, setStarting] = useState(false);

  if (loading) return <div className="p-4"><Skeleton className="h-64 w-full" /></div>;
  if (!caseData) return <div className="p-4 text-center">{t('order.notFound')}</div>;

  const status = caseData.status as CaseStatus;

  const handleStart = async () => {
    setStarting(true);
    try {
      await api.post(`/cases/${id}/start`);
      toast.success(t('order.startJobSuccess'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('order.startJobFailed'));
    } finally {
      setStarting(false);
    }
  };

  const actionButtons = [
    {
      label: t('order.receiveCar'),
      icon: Car,
      href: `/orders/${id}/receive`,
      visible: status === CaseStatus.APPOINTMENT_SCHEDULED,
      variant: 'brand' as const,
    },
    {
      label: t('order.startInspection'),
      icon: Camera,
      href: `/orders/${id}/inspection`,
      visible: status === CaseStatus.VEHICLE_RECEIVED,
      variant: 'brand' as const,
    },
    {
      label: t('order.addItems'),
      icon: Package,
      href: `/orders/${id}/items`,
      visible: status === CaseStatus.UNDER_INSPECTION,
      variant: 'outline' as const,
    },
    {
      label: 'Review & Submit Estimate',
      icon: ClipboardCheck,
      href: `/orders/${id}/review`,
      visible: status === CaseStatus.UNDER_INSPECTION,
      variant: 'brand' as const,
    },
    {
      label: t('order.startJob'),
      icon: Wrench,
      action: handleStart,
      visible: status === CaseStatus.ESTIMATE_APPROVED,
      variant: 'brand' as const,
      loading: starting,
    },
    {
      label: t('order.workOrder'),
      icon: CheckSquare,
      href: `/orders/${id}/work-order`,
      visible: status === CaseStatus.REPAIR_IN_PROGRESS,
      variant: 'brand' as const,
    },
    {
      label: t('order.handover'),
      icon: Truck,
      href: `/orders/${id}/handover`,
      visible: status === CaseStatus.READY_FOR_PICKUP,
      variant: 'brand' as const,
    },
    {
      label: t('order.submitInvoice'),
      icon: FileText,
      href: `/orders/${id}/invoice`,
      visible: status === CaseStatus.DELIVERED,
      variant: 'brand' as const,
    },
  ];

  const visibleActions = actionButtons.filter((a) => a.visible);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.push('/orders')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">{t('order.title', { id: id.slice(0, 8) })}</h1>
      </div>

      {/* Status + SLA */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={status} />
          {caseData.slaTimers?.length > 0 && (
            <SlaTimerBadge timer={caseData.slaTimers[caseData.slaTimers.length - 1]} />
          )}
        </div>
        <p className="mt-1 font-mono text-xs text-muted-foreground">{caseData.accidentRef}</p>
      </Card>

      {/* Vehicle */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Car className="h-4 w-4" /> {t('order.vehicle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-muted-foreground">{t('order.make')}: </span>{caseData.vehicle.make}</div>
          <div><span className="text-muted-foreground">{t('order.model')}: </span>{caseData.vehicle.model}</div>
          <div><span className="text-muted-foreground">{t('order.year')}: </span>{caseData.vehicle.year}</div>
          <div><span className="text-muted-foreground">{t('order.plate')}: </span>{caseData.vehicle.plate}</div>
          <div><span className="text-muted-foreground">{t('order.color')}: </span>{caseData.vehicle.color}</div>
          <div><span className="text-muted-foreground">{t('order.vin')}: </span><span className="font-mono text-xs">{caseData.vehicle.vin}</span></div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {visibleActions.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="font-semibold">{t('order.actions')}</h2>
          {visibleActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant={action.variant}
                size="xl"
                className="w-full justify-start gap-3"
                onClick={() => action.href ? router.push(action.href) : action.action?.()}
                disabled={action.loading}
              >
                <Icon className="h-5 w-5" />
                {action.loading ? t('order.processing') : action.label}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}

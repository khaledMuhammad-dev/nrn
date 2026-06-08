'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCases } from '@/hooks/useCase';
import { StatusBadge } from '@/components/case/StatusBadge';
import { SlaTimerBadge } from '@/components/case/SlaTimer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CaseStatus, Case } from '@nrn/shared';
import { formatDate } from '@nrn/shared';
import { Car, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';

export default function OrdersPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const { cases, loading } = useCases(profile?.workshopId ?? undefined);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const pendingAssignment = cases.find((c) => c.status === CaseStatus.ASSIGNMENT_PENDING);

  const FILTERS = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Under Service' },
    { value: 'parts', label: 'Parts' },
    { value: 'pickup', label: 'Pickup' },
  ];

  const filtered = cases.filter((c) => {
    if (statusFilter === 'active') return [CaseStatus.VEHICLE_RECEIVED, CaseStatus.UNDER_INSPECTION, CaseStatus.REPAIR_IN_PROGRESS].includes(c.status as CaseStatus);
    if (statusFilter === 'parts')  return c.status === CaseStatus.PARTS_PENDING;
    if (statusFilter === 'pickup') return c.status === CaseStatus.READY_FOR_PICKUP;
    return true;
  });

  const handleAccept = async () => {
    if (!selectedCase) return;
    setProcessing(true);
    try {
      await api.post(`/cases/${selectedCase.id}/accept`);
      toast.success('Order accepted!');
      setSelectedCase(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedCase || rejectReason.length < 10) return;
    setProcessing(true);
    try {
      await api.post(`/cases/${selectedCase.id}/reject`, { reason: rejectReason });
      toast.info('Order rejected');
      setSelectedCase(null);
      setRejectReason('');
      setShowReject(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col gap-3 p-4">
      {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
    </div>
  );

  return (
    <div className="flex flex-col gap-3 p-4">
      <h1 className="text-xl font-bold">Orders</h1>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            size="sm"
            variant={statusFilter === f.value ? 'brand' : 'outline'}
            onClick={() => setStatusFilter(f.value)}
            className="shrink-0"
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* New Assignment Popup */}
      <AnimatePresence>
        {pendingAssignment && !selectedCase && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card
              className="cursor-pointer border-2 border-[var(--brand-accent)] p-4 shadow-lg"
              onClick={() => setSelectedCase(pendingAssignment)}
            >
              <div className="mb-2 flex items-center gap-2 text-[var(--brand-accent)]">
                <Car className="h-5 w-5" />
                <span className="font-bold">New Car from Najm!</span>
              </div>
              <p className="text-sm">{pendingAssignment.vehicle.make} {pendingAssignment.vehicle.model} — {pendingAssignment.vehicle.plate}</p>
              <p className="text-xs text-muted-foreground">Tap to review</p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order List */}
      {filtered.map((c, idx) => (
        <motion.div
          key={c.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
        >
          <Card
            className="cursor-pointer p-4 hover:shadow-md transition-shadow"
            onClick={() => router.push(`/orders/${c.id}`)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">{c.vehicle.make} {c.vehicle.model} {c.vehicle.year}</span>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{c.vehicle.plate}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusBadge status={c.status as CaseStatus} />
                  {c.slaTimers?.length > 0 && (
                    <SlaTimerBadge timer={c.slaTimers[c.slaTimers.length - 1]} />
                  )}
                </div>
              </div>
              <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
            </div>
          </Card>
        </motion.div>
      ))}

      {/* New Car Modal */}
      <AnimatePresence>
        {selectedCase && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end bg-black/60"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full rounded-t-2xl bg-background p-6"
            >
              <h2 className="mb-4 text-xl font-bold">New Assignment</h2>
              <div className="mb-6 flex flex-col gap-3 rounded-xl bg-muted/50 p-4 text-sm">
                <div><span className="font-medium">Vehicle: </span>{selectedCase.vehicle.make} {selectedCase.vehicle.model} {selectedCase.vehicle.year}</div>
                <div><span className="font-medium">Plate: </span>{selectedCase.vehicle.plate}</div>
                <div><span className="font-medium">Color: </span>{selectedCase.vehicle.color}</div>
                <div><span className="font-medium">Ref: </span>{selectedCase.accidentRef}</div>
              </div>

              {!showReject ? (
                <div className="flex gap-3">
                  <Button
                    size="xl"
                    variant="destructive"
                    className="flex-1"
                    onClick={() => setShowReject(true)}
                    disabled={processing}
                  >
                    <XCircle className="mr-2 h-5 w-5" /> Reject
                  </Button>
                  <Button
                    size="xl"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={handleAccept}
                    disabled={processing}
                  >
                    <CheckCircle className="mr-2 h-5 w-5" /> Accept
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Textarea
                    placeholder="Reason for rejection (min 10 characters)"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setShowReject(false)}>Back</Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      disabled={rejectReason.length < 10 || processing}
                      onClick={handleReject}
                    >
                      Confirm Rejection
                    </Button>
                  </div>
                </div>
              )}

              <Button variant="ghost" className="mt-3 w-full" onClick={() => { setSelectedCase(null); setShowReject(false); }}>
                Cancel
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

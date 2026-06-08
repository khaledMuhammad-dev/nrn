'use client';

import { motion } from 'framer-motion';
import { CaseStatus } from '@nrn/shared';
import { CASE_STATUS_LABELS } from '@nrn/shared';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: CaseStatus;
  lang?: 'en' | 'ar';
  className?: string;
  animate?: boolean;
}

function getStatusVariant(status: CaseStatus): string {
  if (status === CaseStatus.CLOSED)    return 'bg-[var(--status-closed)] text-white';
  if (status === CaseStatus.CANCELLED) return 'bg-[var(--status-danger)] text-white';
  if ([CaseStatus.READY_FOR_PICKUP, CaseStatus.DELIVERED, CaseStatus.REPAIR_COMPLETED].includes(status))
    return 'bg-[var(--status-done)] text-white';
  if ([CaseStatus.ESTIMATE_PENDING, CaseStatus.PARTS_PENDING, CaseStatus.INVOICE_PENDING].includes(status))
    return 'bg-[var(--status-warn)] text-white';
  if ([CaseStatus.ASSIGNMENT_PENDING, CaseStatus.REJECTED_REASSIGN].includes(status))
    return 'bg-orange-500 text-white';
  return 'bg-[var(--status-active)] text-white';
}

export function StatusBadge({ status, lang = 'en', className, animate = true }: StatusBadgeProps) {
  const label = CASE_STATUS_LABELS[status]?.[lang] ?? status;
  const colorClass = getStatusVariant(status);

  return (
    <motion.span
      key={status}
      initial={animate ? { scale: 0.8, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        colorClass,
        className
      )}
    >
      {label}
    </motion.span>
  );
}

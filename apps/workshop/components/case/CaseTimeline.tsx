'use client';

import { motion } from 'framer-motion';
import { Check, Circle } from 'lucide-react';
import { Case, CaseStatus } from '@nrn/shared';
import { CASE_STATUS_ORDER, CASE_STATUS_LABELS } from '@nrn/shared';
import { formatDateTime, toDate } from '@nrn/shared';
import { cn } from '@/lib/utils';

interface CaseTimelineProps {
  caseData: Case;
  lang?: 'en' | 'ar';
}

export function CaseTimeline({ caseData, lang = 'en' }: CaseTimelineProps) {
  const currentIdx = CASE_STATUS_ORDER.indexOf(caseData.status as CaseStatus);

  const getAuditEntry = (status: CaseStatus) =>
    caseData.auditLog?.find((e) => e.status === status);

  return (
    <div className="relative">
      {CASE_STATUS_ORDER.map((status, idx) => {
        const isPast    = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const isFuture  = idx > currentIdx;
        const audit     = getAuditEntry(status);

        return (
          <motion.div
            key={status}
            initial={{ opacity: 0, x: lang === 'ar' ? 10 : -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.25 }}
            className="flex gap-3 pb-4"
          >
            {/* Timeline dot */}
            <div className="flex flex-col items-center">
              <div className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                isPast    && 'border-[var(--status-done)] bg-[var(--status-done)] text-white',
                isCurrent && 'border-[var(--status-active)] bg-[var(--status-active)] text-white status-active-pulse',
                isFuture  && 'border-gray-300 bg-white text-gray-400'
              )}>
                {isPast ? <Check className="h-4 w-4" /> : <Circle className={cn('h-3 w-3', isCurrent && 'fill-current')} />}
              </div>
              {idx < CASE_STATUS_ORDER.length - 1 && (
                <div className={cn('mt-1 w-0.5 flex-1 min-h-[24px]', isPast ? 'bg-[var(--status-done)]' : 'bg-gray-200')} />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-2">
              <p className={cn('text-sm font-medium', isFuture && 'text-muted-foreground')}>
                {CASE_STATUS_LABELS[status]?.[lang] ?? status}
              </p>
              {audit && (
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(audit.timestamp, lang)}
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

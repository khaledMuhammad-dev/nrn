'use client';

import { useEffect, useState } from 'react';
import { SlaTimer as SlaTimerType, CaseStatus } from '@nrn/shared';
import { formatCountdown, toDate } from '@nrn/shared';
import { cn } from '@/lib/utils';

interface SlaTimerProps {
  timer: SlaTimerType;
  className?: string;
}

export function SlaTimerBadge({ timer, className }: SlaTimerProps) {
  const [remaining, setRemaining] = useState(0);
  const [status, setStatus] = useState(timer.status);

  useEffect(() => {
    const target = toDate(timer.targetAt).getTime();
    const tick = () => {
      const now = Date.now();
      const diff = target - now;
      setRemaining(Math.max(0, diff));
      const started = toDate(timer.startedAt).getTime();
      const total = target - started;
      const elapsed = now - started;
      const ratio = elapsed / total;
      if (diff <= 0) setStatus('breached');
      else if (ratio >= 0.8) setStatus('at_risk');
      else setStatus('on_track');
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const colorClass =
    status === 'breached' ? 'bg-red-100 text-red-700 border-red-300 sla-breached' :
    status === 'at_risk'  ? 'bg-amber-100 text-amber-700 border-amber-300' :
    'bg-green-100 text-green-700 border-green-300';

  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-mono font-medium',
      colorClass,
      className
    )}>
      {status === 'breached' ? '⚠ ' : '⏱ '}
      {formatCountdown(remaining)}
    </span>
  );
}

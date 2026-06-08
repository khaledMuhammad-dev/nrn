import { Timestamp } from '../types/case';

export function toDate(ts: Timestamp): Date {
  if (ts instanceof Date) return ts;
  if (typeof ts === 'string') return new Date(ts);
  if (typeof ts === 'object' && 'seconds' in ts) {
    return new Date(ts.seconds * 1000 + (ts.nanoseconds ?? 0) / 1e6);
  }
  return new Date();
}

export function formatDate(ts: Timestamp, locale: string = 'en'): string {
  const d = toDate(ts);
  return d.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(ts: Timestamp, locale: string = 'en'): string {
  const d = toDate(ts);
  return d.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  return [hours, minutes, seconds].map((n) => String(n).padStart(2, '0')).join(':');
}

export function addMs(date: Date, ms: number): Date {
  return new Date(date.getTime() + ms);
}

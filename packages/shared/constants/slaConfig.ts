import { CaseStatus } from '../types/case';

// SLA durations in milliseconds
export const SLA_DURATIONS_MS: Partial<Record<CaseStatus, number>> = {
  [CaseStatus.ASSIGNMENT_PENDING]:    2 * 60 * 60 * 1000,   // 2 hours
  [CaseStatus.VEHICLE_RECEIVED]:      4 * 60 * 60 * 1000,   // 4 hours
  [CaseStatus.UNDER_INSPECTION]:      24 * 60 * 60 * 1000,  // 24 hours
  [CaseStatus.ESTIMATE_PENDING]:      48 * 60 * 60 * 1000,  // 48 hours
  [CaseStatus.REPAIR_IN_PROGRESS]:    7 * 24 * 60 * 60 * 1000, // 7 days
};

export const SLA_AT_RISK_THRESHOLD = 0.8; // 80% of SLA elapsed = at-risk

export function getSlaStatus(
  stage: CaseStatus,
  startedAt: Date,
  now: Date = new Date()
): 'on_track' | 'at_risk' | 'breached' {
  const duration = SLA_DURATIONS_MS[stage];
  if (!duration) return 'on_track';
  const elapsed = now.getTime() - startedAt.getTime();
  const ratio = elapsed / duration;
  if (ratio >= 1) return 'breached';
  if (ratio >= SLA_AT_RISK_THRESHOLD) return 'at_risk';
  return 'on_track';
}

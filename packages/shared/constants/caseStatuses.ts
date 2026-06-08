import { CaseStatus } from '../types/case';

export const CASE_STATUS_LABELS: Record<CaseStatus, { en: string; ar: string }> = {
  [CaseStatus.ACCIDENT_REPORTED]:     { en: 'Accident Reported',     ar: 'تم الإبلاغ عن الحادث' },
  [CaseStatus.WORKSHOP_SELECTION]:    { en: 'Selecting Workshop',    ar: 'اختيار الورشة' },
  [CaseStatus.ASSIGNMENT_PENDING]:    { en: 'Assignment Pending',    ar: 'في انتظار التعيين' },
  [CaseStatus.REJECTED_REASSIGN]:     { en: 'Reassigning',           ar: 'إعادة التعيين' },
  [CaseStatus.APPOINTMENT_SCHEDULED]: { en: 'Appointment Scheduled', ar: 'تم تحديد الموعد' },
  [CaseStatus.VEHICLE_RECEIVED]:      { en: 'Vehicle Received',      ar: 'تم استلام المركبة' },
  [CaseStatus.UNDER_INSPECTION]:      { en: 'Under Inspection',      ar: 'قيد الفحص' },
  [CaseStatus.ESTIMATE_PENDING]:      { en: 'Estimate Pending',      ar: 'في انتظار التقدير' },
  [CaseStatus.ESTIMATE_APPROVED]:     { en: 'Estimate Approved',     ar: 'تمت الموافقة على التقدير' },
  [CaseStatus.PARTS_PENDING]:         { en: 'Parts Pending',         ar: 'في انتظار القطع' },
  [CaseStatus.REPAIR_IN_PROGRESS]:    { en: 'Repair In Progress',    ar: 'الإصلاح جارٍ' },
  [CaseStatus.REPAIR_COMPLETED]:      { en: 'Repair Completed',      ar: 'اكتمل الإصلاح' },
  [CaseStatus.READY_FOR_PICKUP]:      { en: 'Ready for Pickup',      ar: 'جاهز للاستلام' },
  [CaseStatus.DELIVERED]:             { en: 'Delivered',             ar: 'تم التسليم' },
  [CaseStatus.INVOICE_PENDING]:       { en: 'Invoice Pending',       ar: 'في انتظار الفاتورة' },
  [CaseStatus.CLOSED]:                { en: 'Closed',                ar: 'مغلق' },
  [CaseStatus.CANCELLED]:             { en: 'Cancelled',             ar: 'ملغى' },
};

export const CASE_STATUS_ORDER: CaseStatus[] = [
  CaseStatus.ACCIDENT_REPORTED,
  CaseStatus.WORKSHOP_SELECTION,
  CaseStatus.ASSIGNMENT_PENDING,
  CaseStatus.APPOINTMENT_SCHEDULED,
  CaseStatus.VEHICLE_RECEIVED,
  CaseStatus.UNDER_INSPECTION,
  CaseStatus.ESTIMATE_PENDING,
  CaseStatus.ESTIMATE_APPROVED,
  CaseStatus.PARTS_PENDING,
  CaseStatus.REPAIR_IN_PROGRESS,
  CaseStatus.REPAIR_COMPLETED,
  CaseStatus.READY_FOR_PICKUP,
  CaseStatus.DELIVERED,
  CaseStatus.INVOICE_PENDING,
  CaseStatus.CLOSED,
];

export const TERMINAL_STATUSES: CaseStatus[] = [CaseStatus.CLOSED, CaseStatus.CANCELLED];

export const VALID_TRANSITIONS: Partial<Record<CaseStatus, CaseStatus[]>> = {
  [CaseStatus.WORKSHOP_SELECTION]:    [CaseStatus.ASSIGNMENT_PENDING],
  [CaseStatus.ASSIGNMENT_PENDING]:    [CaseStatus.APPOINTMENT_SCHEDULED, CaseStatus.REJECTED_REASSIGN],
  [CaseStatus.REJECTED_REASSIGN]:     [CaseStatus.ASSIGNMENT_PENDING],
  [CaseStatus.APPOINTMENT_SCHEDULED]: [CaseStatus.VEHICLE_RECEIVED, CaseStatus.CANCELLED],
  [CaseStatus.VEHICLE_RECEIVED]:      [CaseStatus.UNDER_INSPECTION],
  [CaseStatus.UNDER_INSPECTION]:      [CaseStatus.ESTIMATE_PENDING],
  [CaseStatus.ESTIMATE_PENDING]:      [CaseStatus.ESTIMATE_APPROVED, CaseStatus.UNDER_INSPECTION],
  [CaseStatus.ESTIMATE_APPROVED]:     [CaseStatus.PARTS_PENDING, CaseStatus.REPAIR_IN_PROGRESS],
  [CaseStatus.PARTS_PENDING]:         [CaseStatus.REPAIR_IN_PROGRESS],
  [CaseStatus.REPAIR_IN_PROGRESS]:    [CaseStatus.REPAIR_COMPLETED],
  [CaseStatus.REPAIR_COMPLETED]:      [CaseStatus.READY_FOR_PICKUP],
  [CaseStatus.READY_FOR_PICKUP]:      [CaseStatus.DELIVERED],
  [CaseStatus.DELIVERED]:             [CaseStatus.INVOICE_PENDING],
  [CaseStatus.INVOICE_PENDING]:       [CaseStatus.CLOSED],
};

export function isValidTransition(from: CaseStatus, to: CaseStatus): boolean {
  const allowed = VALID_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

import { CaseStatus, UserRole, Notification } from '../types/case';
import { CASE_STATUS_ORDER } from '../constants/caseStatuses';

export function getStatusIndex(status: CaseStatus): number {
  return CASE_STATUS_ORDER.indexOf(status);
}

export function isStatusBefore(a: CaseStatus, b: CaseStatus): boolean {
  return getStatusIndex(a) < getStatusIndex(b);
}

export function isStatusAfter(a: CaseStatus, b: CaseStatus): boolean {
  return getStatusIndex(a) > getStatusIndex(b);
}

export type NotificationRecipient = { role: UserRole; userId?: string };

export function getNotificationRecipients(
  event: CaseStatus,
  customerId: string,
  workshopAdvisorId: string,
  workshopOwnerId: string,
  operatorId: string
): NotificationRecipient[] {
  switch (event) {
    case CaseStatus.ASSIGNMENT_PENDING:
      return [
        { role: UserRole.ADVISOR, userId: workshopAdvisorId },
        { role: UserRole.OWNER, userId: workshopOwnerId },
        { role: UserRole.OPERATOR, userId: operatorId },
      ];
    case CaseStatus.APPOINTMENT_SCHEDULED:
      return [
        { role: UserRole.CUSTOMER, userId: customerId },
        { role: UserRole.OPERATOR, userId: operatorId },
      ];
    case CaseStatus.VEHICLE_RECEIVED:
      return [
        { role: UserRole.CUSTOMER, userId: customerId },
        { role: UserRole.OPERATOR, userId: operatorId },
      ];
    case CaseStatus.ESTIMATE_PENDING:
      return [{ role: UserRole.OPERATOR, userId: operatorId }];
    case CaseStatus.ESTIMATE_APPROVED:
    case CaseStatus.REJECTED_REASSIGN:
      return [
        { role: UserRole.CUSTOMER, userId: customerId },
        { role: UserRole.ADVISOR, userId: workshopAdvisorId },
      ];
    case CaseStatus.READY_FOR_PICKUP:
      return [{ role: UserRole.CUSTOMER, userId: customerId }];
    case CaseStatus.DELIVERED:
    case CaseStatus.CLOSED:
      return [
        { role: UserRole.CUSTOMER, userId: customerId },
        { role: UserRole.ADVISOR, userId: workshopAdvisorId },
        { role: UserRole.OPERATOR, userId: operatorId },
      ];
    default:
      return [];
  }
}

export function buildNotification(
  status: CaseStatus,
  caseId: string,
  recipientId: string,
  recipientRole: UserRole
): Omit<Notification, 'id'> {
  const messages: Partial<Record<CaseStatus, { title: string; titleAr: string; body: string; bodyAr: string }>> = {
    [CaseStatus.ASSIGNMENT_PENDING]: {
      title: 'New Assignment',
      titleAr: 'تعيين جديد',
      body: `Case ${caseId} has been assigned to your workshop.`,
      bodyAr: `تم تعيين الحالة ${caseId} لورشتك.`,
    },
    [CaseStatus.APPOINTMENT_SCHEDULED]: {
      title: 'Appointment Confirmed',
      titleAr: 'تم تأكيد الموعد',
      body: `Your appointment has been scheduled for case ${caseId}.`,
      bodyAr: `تم تحديد موعدك للحالة ${caseId}.`,
    },
    [CaseStatus.VEHICLE_RECEIVED]: {
      title: 'Vehicle Received',
      titleAr: 'تم استلام المركبة',
      body: `Your vehicle has been received by the workshop for case ${caseId}.`,
      bodyAr: `تم استلام مركبتك من قبل الورشة للحالة ${caseId}.`,
    },
    [CaseStatus.ESTIMATE_PENDING]: {
      title: 'Estimate Submitted',
      titleAr: 'تم تقديم التقدير',
      body: `An estimate has been submitted for case ${caseId}. Please review.`,
      bodyAr: `تم تقديم تقدير للحالة ${caseId}. يرجى المراجعة.`,
    },
    [CaseStatus.ESTIMATE_APPROVED]: {
      title: 'Estimate Approved',
      titleAr: 'تمت الموافقة على التقدير',
      body: `The estimate for case ${caseId} has been approved.`,
      bodyAr: `تمت الموافقة على تقدير الحالة ${caseId}.`,
    },
    [CaseStatus.READY_FOR_PICKUP]: {
      title: 'Your Car is Ready!',
      titleAr: 'سيارتك جاهزة!',
      body: `Your vehicle is ready for pickup for case ${caseId}.`,
      bodyAr: `مركبتك جاهزة للاستلام للحالة ${caseId}.`,
    },
    [CaseStatus.DELIVERED]: {
      title: 'Vehicle Delivered',
      titleAr: 'تم تسليم المركبة',
      body: `Case ${caseId} has been delivered successfully.`,
      bodyAr: `تم تسليم الحالة ${caseId} بنجاح.`,
    },
    [CaseStatus.CLOSED]: {
      title: 'Case Closed',
      titleAr: 'تم إغلاق الحالة',
      body: `Case ${caseId} has been closed.`,
      bodyAr: `تم إغلاق الحالة ${caseId}.`,
    },
  };

  const msg = messages[status] ?? {
    title: 'Case Updated',
    titleAr: 'تم تحديث الحالة',
    body: `Case ${caseId} status has been updated.`,
    bodyAr: `تم تحديث حالة ${caseId}.`,
  };

  return {
    ...msg,
    recipientId,
    recipientRole,
    caseId,
    read: false,
    createdAt: new Date().toISOString(),
  };
}

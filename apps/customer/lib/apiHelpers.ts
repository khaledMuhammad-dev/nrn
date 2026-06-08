import { adminDb, adminAuth, admin } from './firebaseAdmin';
import { CaseStatus, UserRole, AuditEntry } from '@nrn/shared';
import { isValidTransition, buildNotification, getNotificationRecipients } from '@nrn/shared';
import type { NextRequest } from 'next/server';

export async function verifyToken(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const token = authHeader.split(' ')[1];
    return await adminAuth.verifyIdToken(token);
  } catch {
    return null;
  }
}

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export function jsonSuccess(data: unknown) {
  return Response.json({ success: true, data });
}

interface TransitionParams {
  caseId: string;
  actorId: string;
  actorRole: UserRole;
  toStatus: CaseStatus;
  extraData?: Record<string, unknown>;
  reason?: string;
}

export async function transitionCase({
  caseId,
  actorId,
  actorRole,
  toStatus,
  extraData = {},
  reason,
}: TransitionParams) {
  const ref  = adminDb.collection('cases').doc(caseId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error('Case not found');

  const caseData = snap.data()!;
  const fromStatus = caseData.status as CaseStatus;

  if (!isValidTransition(fromStatus, toStatus)) {
    throw new Error(`Invalid transition: ${fromStatus} → ${toStatus}`);
  }

  const auditEntry: AuditEntry = {
    status: toStatus,
    actorId,
    actorRole,
    timestamp: new Date().toISOString() as unknown as import('@nrn/shared').Timestamp,
    ...(reason ? { reason } : {}),
  };

  await ref.update({
    status: toStatus,
    ...extraData,
    auditLog: admin.firestore.FieldValue.arrayUnion(auditEntry),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Fan out notifications
  await writeNotifications(caseId, toStatus, caseData.customerId, actorId);

  return { ...(await ref.get()).data(), id: caseId };
}

async function writeNotifications(caseId: string, status: CaseStatus, customerId: string, actorId: string) {
  // Look up workshop advisors and operators
  const caseSnap = await adminDb.collection('cases').doc(caseId).get();
  const workshopId = caseSnap.data()?.assignedWorkshopId;

  let advisorId = 'advisor_default';
  let ownerId   = 'owner_default';
  let operatorId = 'operator_default';

  // Fetch operator
  const opSnap = await adminDb.collection('users').where('role', '==', 'operator').limit(1).get();
  if (!opSnap.empty) operatorId = opSnap.docs[0].id;

  if (workshopId) {
    const advisorSnap = await adminDb.collection('users')
      .where('role', '==', 'advisor')
      .where('workshopId', '==', workshopId)
      .limit(1).get();
    if (!advisorSnap.empty) advisorId = advisorSnap.docs[0].id;

    const ownerSnap = await adminDb.collection('users')
      .where('role', '==', 'owner')
      .where('workshopId', '==', workshopId)
      .limit(1).get();
    if (!ownerSnap.empty) ownerId = ownerSnap.docs[0].id;
  }

  const recipients = getNotificationRecipients(status, customerId, advisorId, ownerId, operatorId);
  const batch = adminDb.batch();

  for (const r of recipients) {
    if (!r.userId || r.userId === actorId) continue;
    const notif = buildNotification(status, caseId, r.userId, r.role);
    const notifRef = adminDb.collection('notifications').doc();
    batch.set(notifRef, { ...notif, id: notifRef.id });
  }

  await batch.commit();
}

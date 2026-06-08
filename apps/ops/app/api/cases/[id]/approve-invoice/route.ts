import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { transitionCase, verifyToken, jsonError, jsonSuccess } from '@/lib/apiHelpers';
import { CaseStatus, UserRole } from '@nrn/shared';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const decoded = await verifyToken(req);
  if (!decoded) return jsonError('Unauthorized', 401);
  const { id } = await params;
  try {
    const invSnap = await adminDb.collection('invoices').where('caseId', '==', id).limit(1).get();
    if (!invSnap.empty) {
      await invSnap.docs[0].ref.update({ approvalStatus: 'approved', approvedBy: decoded.uid });
    }
    const updated = await transitionCase({
      caseId:    id,
      actorId:   decoded.uid,
      actorRole: UserRole.OPERATOR,
      toStatus:  CaseStatus.CLOSED,
    });
    return jsonSuccess(updated);
  } catch (err: unknown) {
    return jsonError(err instanceof Error ? err.message : 'Failed', 500);
  }
}

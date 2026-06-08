import { NextRequest } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/lib/firebaseAdmin';
import { transitionCase, verifyToken, jsonError, jsonSuccess } from '@/lib/apiHelpers';
import { CaseStatus, UserRole } from '@nrn/shared';

const schema = z.object({ reason: z.string().min(1) });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const decoded = await verifyToken(req);
  if (!decoded) return jsonError('Unauthorized', 401);
  const { id } = await params;
  const body = schema.safeParse(await req.json());
  if (!body.success) return jsonError(body.error.message);
  try {
    const estSnap = await adminDb.collection('estimates').where('caseId', '==', id).limit(1).get();
    if (!estSnap.empty) {
      await estSnap.docs[0].ref.update({ approvalStatus: 'rejected', reason: body.data.reason });
    }
    const updated = await transitionCase({
      caseId:    id,
      actorId:   decoded.uid,
      actorRole: UserRole.OPERATOR,
      toStatus:  CaseStatus.UNDER_INSPECTION,
      reason:    body.data.reason,
    });
    return jsonSuccess(updated);
  } catch (err: unknown) {
    return jsonError(err instanceof Error ? err.message : 'Failed', 500);
  }
}

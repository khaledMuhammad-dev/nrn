import { NextRequest } from 'next/server';
import { z } from 'zod';
import { adminDb, admin } from '@/lib/firebaseAdmin';
import { transitionCase, verifyToken, jsonError, jsonSuccess } from '@/lib/apiHelpers';
import { CaseStatus, UserRole } from '@nrn/shared';

const schema = z.object({ signatureUrl: z.string().url() });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const decoded = await verifyToken(req);
  if (!decoded) return jsonError('Unauthorized', 401);
  const { id } = await params;
  const body = schema.safeParse(await req.json());
  if (!body.success) return jsonError(body.error.message);
  try {
    const handoverRef = adminDb.collection('handovers').doc();
    await handoverRef.set({
      id: handoverRef.id,
      caseId: id,
      type: 'receive',
      signatureImageUrl: body.data.signatureUrl,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    const updated = await transitionCase({
      caseId:    id,
      actorId:   decoded.uid,
      actorRole: UserRole.ADVISOR,
      toStatus:  CaseStatus.VEHICLE_RECEIVED,
    });
    return jsonSuccess(updated);
  } catch (err: unknown) {
    return jsonError(err instanceof Error ? err.message : 'Failed', 500);
  }
}

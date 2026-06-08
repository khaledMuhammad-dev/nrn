import { NextRequest } from 'next/server';
import { z } from 'zod';
import { adminDb, admin } from '@/lib/firebaseAdmin';
import { transitionCase, verifyToken, jsonError, jsonSuccess } from '@/lib/apiHelpers';
import { CaseStatus, UserRole } from '@nrn/shared';

const lineItemSchema = z.object({
  description: z.string(),
  quantity:    z.number().positive(),
  unitPrice:   z.number().positive(),
  partNumber:  z.string().optional(),
});

const schema = z.object({
  lineItems: z.array(lineItemSchema).min(1),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const decoded = await verifyToken(req);
  if (!decoded) return jsonError('Unauthorized', 401);
  const { id } = await params;
  const body = schema.safeParse(await req.json());
  if (!body.success) return jsonError(body.error.message);
  try {
    const total = body.data.lineItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
    const estRef = adminDb.collection('estimates').doc();
    await estRef.set({
      id: estRef.id,
      caseId: id,
      lineItems: body.data.lineItems,
      total,
      approvalStatus: 'pending',
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    const updated = await transitionCase({
      caseId:    id,
      actorId:   decoded.uid,
      actorRole: UserRole.ADVISOR,
      toStatus:  CaseStatus.ESTIMATE_PENDING,
    });
    return jsonSuccess(updated);
  } catch (err: unknown) {
    return jsonError(err instanceof Error ? err.message : 'Failed', 500);
  }
}

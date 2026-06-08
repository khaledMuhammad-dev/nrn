import { NextRequest } from 'next/server';
import { z } from 'zod';
import { adminDb, admin } from '@/lib/firebaseAdmin';
import { transitionCase, verifyToken, jsonError, jsonSuccess } from '@/lib/apiHelpers';
import { CaseStatus, UserRole } from '@nrn/shared';

const schema = z.object({
  amount:    z.number().positive(),
  lineItems: z.array(z.object({
    description: z.string(),
    quantity:    z.number(),
    unitPrice:   z.number(),
  })),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const decoded = await verifyToken(req);
  if (!decoded) return jsonError('Unauthorized', 401);
  const { id } = await params;
  const body = schema.safeParse(await req.json());
  if (!body.success) return jsonError(body.error.message);
  try {
    const invRef = adminDb.collection('invoices').doc();
    await invRef.set({
      id: invRef.id,
      caseId: id,
      amount: body.data.amount,
      lineItems: body.data.lineItems,
      approvalStatus: 'pending',
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    const updated = await transitionCase({
      caseId:    id,
      actorId:   decoded.uid,
      actorRole: UserRole.ADVISOR,
      toStatus:  CaseStatus.INVOICE_PENDING,
    });
    return jsonSuccess(updated);
  } catch (err: unknown) {
    return jsonError(err instanceof Error ? err.message : 'Failed', 500);
  }
}

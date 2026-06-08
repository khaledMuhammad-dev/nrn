import { NextRequest } from 'next/server';
import { z } from 'zod';
import { adminDb, admin } from '@/lib/firebaseAdmin';
import { transitionCase, verifyToken, jsonError, jsonSuccess } from '@/lib/apiHelpers';
import { CaseStatus, UserRole } from '@nrn/shared';

const schema = z.object({
  slotId:     z.string(),
  workshopId: z.string(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const decoded = await verifyToken(req);
  if (!decoded) return jsonError('Unauthorized', 401);

  const { id } = await params;
  const body = schema.safeParse(await req.json());
  if (!body.success) return jsonError(body.error.message);

  try {
    const { slotId, workshopId } = body.data;

    // Increment slot booked count
    const slotRef = adminDb.collection('slots').doc(slotId);
    await adminDb.runTransaction(async (tx) => {
      const slotSnap = await tx.get(slotRef);
      if (!slotSnap.exists) throw new Error('Slot not found');
      const slot = slotSnap.data()!;
      if (slot.bookedCount >= slot.capacity) throw new Error('Slot is full');
      tx.update(slotRef, { bookedCount: admin.firestore.FieldValue.increment(1) });
    });

    const updated = await transitionCase({
      caseId:    id,
      actorId:   decoded.uid,
      actorRole: UserRole.CUSTOMER,
      toStatus:  CaseStatus.ASSIGNMENT_PENDING,
      extraData: { assignedWorkshopId: workshopId, appointmentSlotId: slotId },
    });

    return jsonSuccess(updated);
  } catch (err: unknown) {
    return jsonError(err instanceof Error ? err.message : 'Failed', 500);
  }
}

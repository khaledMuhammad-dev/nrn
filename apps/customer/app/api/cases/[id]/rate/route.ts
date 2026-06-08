import { NextRequest } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyToken, jsonError, jsonSuccess } from '@/lib/apiHelpers';

const schema = z.object({ rating: z.number().min(1).max(5) });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const decoded = await verifyToken(req);
  if (!decoded) return jsonError('Unauthorized', 401);

  const { id } = await params;
  const body = schema.safeParse(await req.json());
  if (!body.success) return jsonError(body.error.message);

  try {
    const snap = await adminDb.collection('cases').doc(id).get();
    if (!snap.exists) return jsonError('Case not found', 404);
    const workshopId = snap.data()?.assignedWorkshopId;
    if (workshopId) {
      const wsRef = adminDb.collection('workshops').doc(workshopId);
      const wsSnap = await wsRef.get();
      if (wsSnap.exists) {
        const ws = wsSnap.data()!;
        const newRating = ((ws.rating ?? 0) + body.data.rating) / 2;
        await wsRef.update({ rating: Math.round(newRating * 10) / 10 });
      }
    }
    await adminDb.collection('cases').doc(id).update({ customerRating: body.data.rating });
    return jsonSuccess({ rated: true });
  } catch (err: unknown) {
    return jsonError(err instanceof Error ? err.message : 'Failed', 500);
  }
}

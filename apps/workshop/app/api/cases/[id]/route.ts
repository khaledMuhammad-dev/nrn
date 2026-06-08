import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyToken, jsonError, jsonSuccess } from '@/lib/apiHelpers';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const decoded = await verifyToken(req);
  if (!decoded) return jsonError('Unauthorized', 401);

  const { id } = await params;
  try {
    const snap = await adminDb.collection('cases').doc(id).get();
    if (!snap.exists) return jsonError('Case not found', 404);

    // Also fetch estimate
    const estSnap = await adminDb.collection('estimates').where('caseId', '==', id).limit(1).get();
    const estimate = estSnap.empty ? null : { id: estSnap.docs[0].id, ...estSnap.docs[0].data() };

    return jsonSuccess({ id: snap.id, ...snap.data(), estimate });
  } catch (err: unknown) {
    return jsonError(err instanceof Error ? err.message : 'Failed', 500);
  }
}

import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyToken, jsonError, jsonSuccess } from '@/lib/apiHelpers';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const snap = await adminDb.collection('workshops').doc(id).get();
    if (!snap.exists) return jsonError('Workshop not found', 404);
    return jsonSuccess({ id: snap.id, ...snap.data() });
  } catch (err: unknown) {
    return jsonError(err instanceof Error ? err.message : 'Failed');
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const decoded = await verifyToken(req);
  if (!decoded) return jsonError('Unauthorized', 401);
  const { id } = await params;
  try {
    const body = await req.json();
    await adminDb.collection('workshops').doc(id).update(body);
    return jsonSuccess({ updated: true });
  } catch (err: unknown) {
    return jsonError(err instanceof Error ? err.message : 'Failed');
  }
}

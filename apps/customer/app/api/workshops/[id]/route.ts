import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { jsonSuccess, jsonError } from '@/lib/apiHelpers';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const snap = await adminDb.collection('workshops').doc(id).get();
    if (!snap.exists) return jsonError('Workshop not found', 404);
    return jsonSuccess({ id: snap.id, ...snap.data() });
  } catch (err: unknown) {
    return jsonError(err instanceof Error ? err.message : 'Failed');
  }
}

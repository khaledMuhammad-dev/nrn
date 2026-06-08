import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { jsonSuccess, jsonError } from '@/lib/apiHelpers';

export async function GET(_req: NextRequest) {
  try {
    const snap = await adminDb.collection('workshops').get();
    return jsonSuccess(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch (err: unknown) {
    return jsonError(err instanceof Error ? err.message : 'Failed');
  }
}

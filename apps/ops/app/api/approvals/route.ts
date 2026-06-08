import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyToken, jsonError, jsonSuccess } from '@/lib/apiHelpers';

export async function GET(req: NextRequest) {
  const decoded = await verifyToken(req);
  if (!decoded) return jsonError('Unauthorized', 401);

  try {
    const [estSnap, invSnap] = await Promise.all([
      adminDb.collection('estimates').where('approvalStatus', '==', 'pending').get(),
      adminDb.collection('invoices').where('approvalStatus',  '==', 'pending').get(),
    ]);

    return jsonSuccess({
      estimates: estSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
      invoices:  invSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    });
  } catch (err: unknown) {
    return jsonError(err instanceof Error ? err.message : 'Failed', 500);
  }
}

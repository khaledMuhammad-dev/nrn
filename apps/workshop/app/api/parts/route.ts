import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { jsonSuccess, jsonError } from '@/lib/apiHelpers';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') ?? '';
    const snap = await adminDb.collection('parts').get();
    let parts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (search) {
      const s = search.toLowerCase();
      parts = parts.filter((p: Record<string, unknown>) =>
        (p.description as string)?.toLowerCase().includes(s) ||
        (p.partNumber as string)?.toLowerCase().includes(s) ||
        (p.descriptionAr as string)?.toLowerCase().includes(s)
      );
    }
    return jsonSuccess(parts);
  } catch (err: unknown) {
    return jsonError(err instanceof Error ? err.message : 'Failed');
  }
}

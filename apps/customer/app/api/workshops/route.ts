import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { jsonSuccess, jsonError } from '@/lib/apiHelpers';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') ?? '';
    const filter = searchParams.get('filter') ?? 'all';

    let query = adminDb.collection('workshops').where('status', '==', 'active');

    if (filter === 'open') {
      query = query.where('availability', '==', 'open') as typeof query;
    }

    const snap = await query.get();
    let workshops = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    if (search) {
      const s = search.toLowerCase();
      workshops = workshops.filter(
        (w: Record<string, unknown>) =>
          (w.name as string)?.toLowerCase().includes(s) ||
          (w.nameAr as string)?.toLowerCase().includes(s) ||
          ((w.location as { address: string })?.address ?? '').toLowerCase().includes(s)
      );
    }

    if (filter === 'top_rated') {
      workshops = workshops.sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
        (b.rating as number) - (a.rating as number));
    }

    return jsonSuccess(workshops);
  } catch (err: unknown) {
    return jsonError(err instanceof Error ? err.message : 'Failed to fetch workshops');
  }
}

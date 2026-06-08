import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { jsonSuccess, jsonError } from '@/lib/apiHelpers';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const today = new Date().toISOString().split('T')[0];
    const snap = await adminDb.collection('slots')
      .where('workshopId', '==', id)
      .get();
    const slots = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((s: any) => s.date >= today)
      .sort((a: any, b: any) => a.date.localeCompare(b.date));
    return jsonSuccess(slots);
  } catch (err: unknown) {
    return jsonError(err instanceof Error ? err.message : 'Failed');
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const ref = adminDb.collection('slots').doc();
    const slot = { id: ref.id, workshopId: id, bookedCount: 0, ...body };
    await ref.set(slot);
    return jsonSuccess(slot);
  } catch (err: unknown) {
    return jsonError(err instanceof Error ? err.message : 'Failed');
  }
}

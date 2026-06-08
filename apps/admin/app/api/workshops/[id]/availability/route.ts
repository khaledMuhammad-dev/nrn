import { NextRequest } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyToken, jsonError, jsonSuccess } from '@/lib/apiHelpers';

const schema = z.object({ status: z.enum(['open', 'busy', 'closed']) });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const decoded = await verifyToken(req);
  if (!decoded) return jsonError('Unauthorized', 401);
  const { id } = await params;
  const body = schema.safeParse(await req.json());
  if (!body.success) return jsonError(body.error.message);
  try {
    await adminDb.collection('workshops').doc(id).update({ availability: body.data.status });
    return jsonSuccess({ availability: body.data.status });
  } catch (err: unknown) {
    return jsonError(err instanceof Error ? err.message : 'Failed', 500);
  }
}

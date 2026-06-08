import { NextRequest } from 'next/server';
import { adminStorage } from '@/lib/firebaseAdmin';
import { jsonError, jsonSuccess } from '@/lib/apiHelpers';

const BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const path = formData.get('path') as string | null;

    if (!file || !path) return jsonError('Missing file or path', 400);

    const buffer = Buffer.from(await file.arrayBuffer());
    const bucket = adminStorage.bucket();
    const fileRef = bucket.file(path);

    await fileRef.save(buffer, {
      contentType: file.type || 'application/octet-stream',
      public: true,
    });

    const url = `https://storage.googleapis.com/${BUCKET}/${path}`;
    return jsonSuccess({ url });
  } catch (err: unknown) {
    return jsonError(err instanceof Error ? err.message : 'Upload failed', 500);
  }
}

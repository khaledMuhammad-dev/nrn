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
    const bucket = adminStorage.bucket(BUCKET);
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

export async function DELETE(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) return jsonError('Missing url', 400);
    const prefix = `https://storage.googleapis.com/${BUCKET}/`;
    const filePath = url.startsWith(prefix) ? url.slice(prefix.length) : url;
    await adminStorage.bucket(BUCKET).file(filePath).delete();
    return jsonSuccess({ deleted: true });
  } catch (err: unknown) {
    return jsonError(err instanceof Error ? err.message : 'Delete failed', 500);
  }
}

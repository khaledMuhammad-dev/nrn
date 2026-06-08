import * as admin from 'firebase-admin';

function ensureAdmin() {
  if (admin.apps.length) return;

  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID ??
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Firebase Admin credentials are not configured. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY.'
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

function createServiceProxy<T extends object>(getService: () => T): T {
  return new Proxy({} as T, {
    get(_target, prop) {
      const service = getService();
      const value = (service as Record<string | symbol, unknown>)[prop];
      return typeof value === 'function'
        ? (value as (...args: unknown[]) => unknown).bind(service)
        : value;
    },
  });
}

export const adminDb = createServiceProxy(() => {
  ensureAdmin();
  return admin.firestore();
});

export const adminAuth = createServiceProxy(() => {
  ensureAdmin();
  return admin.auth();
});

export const adminStorage = createServiceProxy(() => {
  ensureAdmin();
  return admin.storage();
});

export { admin };

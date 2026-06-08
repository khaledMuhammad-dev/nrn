/**
 * Deploy Firestore composite indexes required by the NRN demo queries.
 * Run: pnpm tsx scripts/deploy-firestore-indexes.ts
 *
 * Firestore index creation is async — it may take a few minutes to build.
 * Re-run to check status.
 */

import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as https from 'https';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const serviceAccount = {
  projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID!,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
  privateKey:  process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n'),
};

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

function httpsRequest(options: https.RequestOptions, body: string): Promise<{ statusCode: number; data: string }> {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ statusCode: res.statusCode ?? 0, data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// Indexes needed by useCases and other queries
// collection is in the URL path; body only contains queryScope + fields
const INDEXES = [
  {
    collection: 'cases',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'customerId', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'DESCENDING' },
    ],
  },
  {
    collection: 'cases',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'assignedWorkshopId', order: 'ASCENDING' },
      { fieldPath: 'updatedAt', order: 'DESCENDING' },
    ],
  },
  {
    collection: 'notifications',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'recipientId', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'DESCENDING' },
    ],
  },
];

async function deployIndexes() {
  const token = await admin.app().options.credential!.getAccessToken();
  const accessToken = token.access_token;
  const projectId = serviceAccount.projectId;
  const database = '(default)';

  for (const idx of INDEXES) {
    const { collection, ...indexBody } = idx;
    const body = JSON.stringify(indexBody);
    const urlPath = `/v1/projects/${projectId}/databases/${database}/collectionGroups/${collection}/indexes`;
    console.log(`Creating index on ${collection}: [${idx.fields.map(f => f.fieldPath).join(', ')}]`);

    const res = await httpsRequest({
      hostname: 'firestore.googleapis.com',
      path: urlPath,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, body);

    const parsed = JSON.parse(res.data);
    if (res.statusCode === 409 || parsed.error?.code === 409) {
      console.log(`  Already exists.`);
    } else if (res.statusCode >= 300) {
      console.warn(`  Failed (${res.statusCode}): ${parsed.error?.message ?? res.data}`);
    } else {
      console.log(`  Created — state: ${parsed.state ?? 'CREATING'}`);
    }
  }

  console.log('\n✅ Index deployment initiated. Indexes build asynchronously (1–5 minutes).');
  console.log('   Queries will return an error until indexes are READY.');
}

deployIndexes().catch(err => { console.error(err); process.exit(1); });

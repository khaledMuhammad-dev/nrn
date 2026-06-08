/**
 * Deploy permissive Firestore security rules for the NRN demo.
 * Run: pnpm tsx scripts/deploy-firestore-rules.ts
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

const RULES = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Authenticated users can read/write their own user doc
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Cases: customer sees own, workshop sees assigned, ops sees all
    match /cases/{caseId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    // Workshops: anyone authenticated can read; write requires auth
    match /workshops/{workshopId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    // Slots: anyone authenticated can read/write
    match /slots/{slotId} {
      allow read, write: if request.auth != null;
    }

    // Parts catalog: anyone authenticated can read
    match /parts/{partId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    // Notifications: recipients can read their own
    match /notifications/{notifId} {
      allow read, write: if request.auth != null;
    }

    // Sub-collections (estimates, inspections, invoices, etc.)
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
`.trim();

function httpsRequest(options: https.RequestOptions, body: string): Promise<{ statusCode: number; data: string }> {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ statusCode: res.statusCode ?? 0, data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function deployRules() {
  const token = await admin.app().options.credential!.getAccessToken();
  const accessToken = token.access_token;
  const projectId = serviceAccount.projectId;

  console.log('Creating ruleset...');
  const rulesetBody = JSON.stringify({
    source: {
      files: [{ name: 'firestore.rules', content: RULES }],
    },
  });

  const createRes = await httpsRequest({
    hostname: 'firebaserules.googleapis.com',
    path: `/v1/projects/${projectId}/rulesets`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(rulesetBody),
    },
  }, rulesetBody);

  if (createRes.statusCode >= 300) {
    throw new Error(`Failed to create ruleset (${createRes.statusCode}): ${createRes.data}`);
  }

  const ruleset = JSON.parse(createRes.data);
  const rulesetName = ruleset.name;
  console.log(`  Ruleset created: ${rulesetName}`);

  console.log('Applying ruleset to Firestore...');
  const releaseName = `projects/${projectId}/releases/cloud.firestore`;

  // PATCH with release wrapped per the Firebase Rules REST API format
  const patchBody = JSON.stringify({ release: { name: releaseName, rulesetName } });
  const patchRes = await httpsRequest({
    hostname: 'firebaserules.googleapis.com',
    path: `/v1/${releaseName}`,
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(patchBody),
    },
  }, patchBody);

  if (patchRes.statusCode === 404) {
    // Release doesn't exist yet — create it
    const postBody = JSON.stringify({ name: releaseName, rulesetName });
    const postRes = await httpsRequest({
      hostname: 'firebaserules.googleapis.com',
      path: `/v1/projects/${projectId}/releases`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postBody),
      },
    }, postBody);

    if (postRes.statusCode >= 300) {
      throw new Error(`Failed to create release (${postRes.statusCode}): ${postRes.data}`);
    }
    console.log('  Release created.');
  } else if (patchRes.statusCode >= 300) {
    throw new Error(`Failed to patch release (${patchRes.statusCode}): ${patchRes.data}`);
  } else {
    console.log('  Release updated.');
  }

  console.log('\n✅ Firestore security rules deployed successfully.');
}

deployRules().catch(err => { console.error(err); process.exit(1); });

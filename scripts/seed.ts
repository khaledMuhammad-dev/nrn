/**
 * NRN Demo Seed Script
 * Run: pnpm run seed
 * Requires: FIREBASE_ADMIN_* env vars set in .env.local
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

const db   = admin.firestore();
const auth = admin.auth();

async function enableEmailPasswordAuth() {
  try {
    const token = await admin.app().options.credential!.getAccessToken();
    const accessToken = token.access_token;
    const projectId = serviceAccount.projectId;
    const body = JSON.stringify({ signIn: { email: { enabled: true, passwordRequired: true } } });
    await new Promise<void>((resolve, reject) => {
      const req = https.request({
        hostname: 'identitytoolkit.googleapis.com',
        path: `/v2/projects/${projectId}/config?updateMask=signIn.email.enabled,signIn.email.passwordRequired`,
        method: 'PATCH',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      }, res => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
          if (res.statusCode && res.statusCode < 300) {
            console.log('  Email/Password auth enabled');
            resolve();
          } else {
            console.warn(`  Could not auto-enable Email/Password (HTTP ${res.statusCode}): ${data}`);
            resolve(); // Non-fatal — continue and let createUser() surface the error naturally
          }
        });
      });
      req.on('error', err => { console.warn('  PATCH config failed:', err.message); resolve(); });
      req.write(body);
      req.end();
    });
  } catch (e) {
    console.warn('  enableEmailPasswordAuth skipped:', (e as Error).message);
  }
}

async function seedUsers() {
  const users = [
    { email: 'customer@nrn.demo',  password: 'Demo1234!', role: 'customer',  displayName: 'Ahmed Al-Sayed' },
    { email: 'advisor@nrn.demo',   password: 'Demo1234!', role: 'advisor',   displayName: 'Khalid Al-Rashid',  workshopId: 'ws_001' },
    { email: 'owner@nrn.demo',     password: 'Demo1234!', role: 'owner',     displayName: 'Mohammed Al-Faris', workshopId: 'ws_001' },
    { email: 'operator@nrn.demo',  password: 'Demo1234!', role: 'operator',  displayName: 'Sara Al-Najm' },
  ];

  const createdUsers: Record<string, string> = {};

  for (const u of users) {
    let uid: string;
    try {
      const existing = await auth.getUserByEmail(u.email);
      uid = existing.uid;
      console.log(`  User exists: ${u.email} (${uid})`);
    } catch {
      const created = await auth.createUser({ email: u.email, password: u.password, displayName: u.displayName });
      uid = created.uid;
      console.log(`  Created user: ${u.email} (${uid})`);
    }

    await auth.setCustomUserClaims(uid, { userRole: u.role, workshopId: u.workshopId ?? null });

    await db.collection('users').doc(uid).set({
      id: uid,
      email: u.email,
      displayName: u.displayName,
      role: u.role,
      workshopId: u.workshopId ?? null,
      language: 'en',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    createdUsers[u.role] = uid;
  }

  return createdUsers;
}

async function seedWorkshop() {
  const ws = {
    id: 'ws_001',
    name: 'Al-Faris Auto Center',
    nameAr: 'مركز الفارس للسيارات',
    location: { lat: 24.7136, lng: 46.6753, address: 'King Fahd Road, Riyadh, Saudi Arabia' },
    services: ['denting', 'painting', 'mechanic'],
    rating: 4.7,
    score: 87,
    status: 'active',
    availability: 'open',
    capacity: {
      bays: 8,
      technicians: 12,
      maxConcurrentJobs: 6,
      workingHours: {
        Sunday:    { open: '08:00', close: '18:00' },
        Monday:    { open: '08:00', close: '18:00' },
        Tuesday:   { open: '08:00', close: '18:00' },
        Wednesday: { open: '08:00', close: '18:00' },
        Thursday:  { open: '08:00', close: '18:00' },
        Friday:    null,
        Saturday:  null,
      },
      blackoutDates: [],
    },
    photos: [],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await db.collection('workshops').doc('ws_001').set(ws, { merge: true });
  console.log('  Workshop seeded: ws_001');

  // Seed slots for next 14 days
  const today = new Date();
  const batch = db.batch();
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const day = d.toLocaleDateString('en-US', { weekday: 'long' });
    if (day === 'Friday' || day === 'Saturday') continue;
    const dateStr = d.toISOString().split('T')[0];
    const timeWindows = ['08:00–10:00', '10:00–12:00', '12:00–14:00', '14:00–16:00', '16:00–18:00'];
    for (const tw of timeWindows) {
      const slotId = `slot_ws001_${dateStr}_${tw.replace(/[^0-9]/g, '')}`;
      const ref = db.collection('slots').doc(slotId);
      batch.set(ref, {
        id: slotId,
        workshopId: 'ws_001',
        date: dateStr,
        timeWindow: tw,
        capacity: 2,
        bookedCount: 0,
      }, { merge: true });
    }
  }
  await batch.commit();
  console.log('  Slots seeded for next 14 days');
}

async function seedCase(customerUid: string) {
  const caseDoc = {
    id: 'case_001',
    customerId: customerUid,
    vehicle: {
      plate: 'ABC 1234',
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
      vin: 'JT2BF22K1W0066777',
      color: 'Silver',
    },
    accidentRef: 'NJM-2026-00001',
    status: 'WORKSHOP_SELECTION',
    assignedWorkshopId: null,
    appointmentSlotId: null,
    slaTimers: [],
    auditLog: [
      {
        status: 'ACCIDENT_REPORTED',
        actorId: customerUid,
        actorRole: 'customer',
        timestamp: admin.firestore.Timestamp.now(),
        reason: 'Initial accident report filed',
      },
      {
        status: 'WORKSHOP_SELECTION',
        actorId: 'system',
        actorRole: 'operator',
        timestamp: admin.firestore.Timestamp.now(),
      },
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await db.collection('cases').doc('case_001').set(caseDoc, { merge: true });
  console.log('  Case seeded: case_001');
}

async function seedPartsCatalog() {
  const parts = [
    { id: 'part_001', partNumber: 'BMP-2024-FR', description: 'Front Bumper Panel',       descriptionAr: 'لوحة الصدام الأمامي',       unitPrice: 850,  inStock: true,  category: 'body' },
    { id: 'part_002', partNumber: 'HDL-2024-LF', description: 'Left Headlight Assembly',  descriptionAr: 'مجموعة المصباح الأيسر',     unitPrice: 1200, inStock: true,  category: 'electrical' },
    { id: 'part_003', partNumber: 'HDL-2024-RF', description: 'Right Headlight Assembly', descriptionAr: 'مجموعة المصباح الأيمن',     unitPrice: 1200, inStock: true,  category: 'electrical' },
    { id: 'part_004', partNumber: 'FND-2024-LF', description: 'Left Front Fender',        descriptionAr: 'الجناح الأمامي الأيسر',     unitPrice: 650,  inStock: true,  category: 'body' },
    { id: 'part_005', partNumber: 'FND-2024-RF', description: 'Right Front Fender',       descriptionAr: 'الجناح الأمامي الأيمن',     unitPrice: 650,  inStock: true,  category: 'body' },
    { id: 'part_006', partNumber: 'RAD-2024-01', description: 'Radiator Assembly',        descriptionAr: 'مجموعة المبرد',             unitPrice: 2100, inStock: false, category: 'engine' },
    { id: 'part_007', partNumber: 'PNT-LABOUR',  description: 'Paint & Labour (panel)',   descriptionAr: 'دهان وعمالة (لوحة)',        unitPrice: 500,  inStock: true,  category: 'labour' },
    { id: 'part_008', partNumber: 'GLS-FRT-01',  description: 'Front Windscreen',         descriptionAr: 'الزجاج الأمامي',            unitPrice: 1800, inStock: true,  category: 'glass' },
    { id: 'part_009', partNumber: 'AIR-BAG-01',  description: 'Driver Airbag Module',     descriptionAr: 'وحدة كيس الهواء للسائق',    unitPrice: 3500, inStock: false, category: 'safety' },
    { id: 'part_010', partNumber: 'TYR-225-55',  description: 'Tyre 225/55 R17',          descriptionAr: 'إطار 225/55 R17',           unitPrice: 420,  inStock: true,  category: 'tyres' },
  ];

  const batch = db.batch();
  for (const p of parts) {
    batch.set(db.collection('parts').doc(p.id), p, { merge: true });
  }
  await batch.commit();
  console.log(`  Parts catalog seeded: ${parts.length} parts`);
}

async function main() {
  console.log('🌱 Seeding NRN Demo data...\n');
  console.log('→ Enabling Email/Password auth...');
  await enableEmailPasswordAuth();
  console.log('→ Seeding users...');
  const uids = await seedUsers();
  console.log('→ Seeding workshop...');
  await seedWorkshop();
  console.log('→ Seeding case...');
  await seedCase(uids['customer']);
  console.log('→ Seeding parts catalog...');
  await seedPartsCatalog();
  console.log('\n✅ Seed complete!');
  console.log('\nDemo credentials:');
  console.log('  Customer:  customer@nrn.demo  / Demo1234!  → http://localhost:3001');
  console.log('  Advisor:   advisor@nrn.demo   / Demo1234!  → http://localhost:3002');
  console.log('  Owner:     owner@nrn.demo      / Demo1234!  → http://localhost:3003');
  console.log('  Operator:  operator@nrn.demo  / Demo1234!  → http://localhost:3004');
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });

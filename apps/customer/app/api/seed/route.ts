import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

async function clearCollection(name: string) {
  const snap = await adminDb.collection(name).get();
  if (snap.empty) return;
  const batches: FirebaseFirestore.WriteBatch[] = [];
  let batch = adminDb.batch();
  let count = 0;
  for (const doc of snap.docs) {
    batch.delete(doc.ref);
    count++;
    if (count === 500) { batches.push(batch); batch = adminDb.batch(); count = 0; }
  }
  if (count > 0) batches.push(batch);
  await Promise.all(batches.map((b) => b.commit()));
}

export async function POST() {
  try {
    // Get customer UID from users collection
    const usersSnap = await adminDb.collection('users').where('role', '==', 'customer').limit(1).get();
    if (usersSnap.empty) {
      return NextResponse.json({ error: 'No customer user found — run pnpm seed first.' }, { status: 400 });
    }
    const customerUid = usersSnap.docs[0].id;

    // Clear all transient data including all cases
    await Promise.all([
      clearCollection('cases'),
      clearCollection('estimates'),
      clearCollection('invoices'),
      clearCollection('notifications'),
      clearCollection('inspections'),
      clearCollection('handovers'),
      clearCollection('partsRequests'),
      clearCollection('workOrders'),
    ]);

    // Re-create the initial demo case
    await adminDb.collection('cases').doc('case_001').set({
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
          timestamp: new Date().toISOString(),
          reason: 'Initial accident report filed',
        },
        {
          status: 'WORKSHOP_SELECTION',
          actorId: 'system',
          actorRole: 'operator',
          timestamp: new Date().toISOString(),
        },
      ],
      updatedAt: new Date().toISOString(),
    });

    // Clear and reseed slots for next 14 days
    const existingSlots = await adminDb.collection('slots').where('workshopId', '==', 'ws_001').get();
    if (!existingSlots.empty) {
      const delBatch = adminDb.batch();
      existingSlots.docs.forEach((d) => delBatch.delete(d.ref));
      await delBatch.commit();
    }

    const today = new Date();
    const slotBatch = adminDb.batch();
    const timeWindows = ['08:00–10:00', '10:00–12:00', '12:00–14:00', '14:00–16:00', '16:00–18:00'];
    for (let i = 1; i <= 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const day = d.toLocaleDateString('en-US', { weekday: 'long' });
      if (day === 'Friday' || day === 'Saturday') continue;
      const dateStr = d.toISOString().split('T')[0];
      for (const tw of timeWindows) {
        const slotId = `slot_ws001_${dateStr}_${tw.replace(/[^0-9]/g, '')}`;
        slotBatch.set(adminDb.collection('slots').doc(slotId), {
          id: slotId,
          workshopId: 'ws_001',
          date: dateStr,
          timeWindow: tw,
          capacity: 2,
          bookedCount: 0,
        });
      }
    }
    await slotBatch.commit();

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Seed failed' },
      { status: 500 }
    );
  }
}

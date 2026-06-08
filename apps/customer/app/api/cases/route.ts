import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

const MAKES = [
  { make: 'Toyota', models: ['Camry', 'Corolla', 'Land Cruiser', 'RAV4', 'Hilux'] },
  { make: 'Hyundai', models: ['Sonata', 'Elantra', 'Tucson', 'Santa Fe'] },
  { make: 'Kia', models: ['Optima', 'Sportage', 'Sorento', 'Carnival'] },
  { make: 'Nissan', models: ['Altima', 'Patrol', 'Sunny', 'X-Trail'] },
  { make: 'Honda', models: ['Accord', 'Civic', 'CR-V', 'Pilot'] },
  { make: 'BMW', models: ['3 Series', '5 Series', 'X5', 'X3'] },
  { make: 'Mercedes', models: ['C-Class', 'E-Class', 'GLE', 'GLC'] },
];

const COLORS = ['White', 'Black', 'Silver', 'Grey', 'Blue', 'Red', 'Pearl'];

const PLATES = () => {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const rand = (n: number) => Math.floor(Math.random() * n);
  const l1 = letters[rand(letters.length)];
  const l2 = letters[rand(letters.length)];
  const l3 = letters[rand(letters.length)];
  const nums = String(rand(9000) + 1000);
  return `${l1}${l2}${l3} ${nums}`;
};

function randomVin() {
  const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
  return Array.from({ length: 17 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function randomRef() {
  const year = new Date().getFullYear();
  const num = String(Math.floor(Math.random() * 90000) + 10000);
  return `NJM-${year}-${num}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { customerId } = body as { customerId?: string };

    if (!customerId) {
      return NextResponse.json({ error: 'customerId required' }, { status: 400 });
    }

    // Pick random vehicle
    const makeEntry = MAKES[Math.floor(Math.random() * MAKES.length)];
    const model = makeEntry.models[Math.floor(Math.random() * makeEntry.models.length)];
    const year = 2018 + Math.floor(Math.random() * 7); // 2018–2024
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];

    const caseId = `case_${Date.now()}`;
    const now = new Date().toISOString();

    await adminDb.collection('cases').doc(caseId).set({
      id: caseId,
      customerId,
      vehicle: {
        plate: PLATES(),
        make: makeEntry.make,
        model,
        year,
        vin: randomVin(),
        color,
      },
      accidentRef: randomRef(),
      status: 'WORKSHOP_SELECTION',
      assignedWorkshopId: null,
      appointmentSlotId: null,
      slaTimers: [],
      auditLog: [
        {
          status: 'ACCIDENT_REPORTED',
          actorId: customerId,
          actorRole: 'customer',
          timestamp: now,
          reason: 'Accident report filed',
        },
        {
          status: 'WORKSHOP_SELECTION',
          actorId: 'system',
          actorRole: 'operator',
          timestamp: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ success: true, caseId });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create case' },
      { status: 500 }
    );
  }
}

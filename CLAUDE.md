# NRN Demo — Claude Code Autonomous Agent Prompt
**Najm Repair Network (NRN) — Accident-to-Workshop Management Platform**
**Version:** 1.0 MVP Demo | **Mode:** Happy-Path Client Demo

---

## HOW TO USE THIS PROMPT

Save this file as `CLAUDE.md` in your project root, then run:

```bash
claude -a "Build the NRN demo from scratch following every instruction in CLAUDE.md. Do not stop until every surface is running and the full happy-path flow is functional."
```

---

## 0. MISSION STATEMENT

Build a **complete, production-quality clickable demo** of the Najm Repair Network (NRN) platform covering the end-to-end happy-path from accident report to case closure. The demo runs **four independent Next.js applications on four different ports**, each simulating a real surface used by a different actor. All surfaces share **one Firestore database** as the single source of truth, so a status change on one surface is immediately visible on all others — this real-time synchronicity is the demo's central selling point.

---

## 1. SYSTEM OVERVIEW

### 1.1 Platform Description

NRN connects four actors through one unified case lifecycle. When a driver has an accident, the case flows from the customer's phone → workshop mobile app → workshop admin panel → NRN operations console until the car is returned and the invoice is settled.

### 1.2 Four Surfaces (Four Ports)

| Port | Surface | Actor | Form Factor |
|------|---------|-------|-------------|
| **3001** | Customer App | Driver / Claimant | Mobile-width responsive (390px) |
| **3002** | Workshop App | Service Advisor / Technician | Mobile-width responsive (390px) |
| **3003** | Workshop Admin Panel | Workshop Owner / Manager | Full desktop web |
| **3004** | NRN Operations Console | Najm / Network Operator | Full desktop web |

### 1.3 Unified Case Status Lifecycle (Single Source of Truth)

Every screen on every surface reacts to this one `status` field on the Case document:

```
ACCIDENT_REPORTED → WORKSHOP_SELECTION → ASSIGNMENT_PENDING →
APPOINTMENT_SCHEDULED → VEHICLE_RECEIVED → UNDER_INSPECTION →
ESTIMATE_PENDING → ESTIMATE_APPROVED → PARTS_PENDING →
REPAIR_IN_PROGRESS → REPAIR_COMPLETED → READY_FOR_PICKUP →
DELIVERED → INVOICE_PENDING → CLOSED
```

Terminal states: `CLOSED`, `CANCELLED`
Reassign path: `REJECTED_REASSIGN` (workshop rejected → goes back to assignment)

---

## 2. TECH STACK (MANDATORY — DO NOT DEVIATE)

### 2.1 Frontend (all four apps)

```
Next.js 14+ (App Router) + TypeScript
TanStack Query v5           — server state, real-time subscriptions
TanStack Table v8           — multi-select, sort, filter, pagination, row actions
React Hook Form + Zod       — all forms with full validation
i18next + react-i18next     — Arabic (RTL) + English (LTR), toggle per session
Framer Motion + GSAP        — page transitions, status badge animations, stagger reveals
shadcn/ui (Radix-based)     — base component library
Tailwind CSS                — all styling, dark/light mode via next-themes
Axios                       — HTTP client (interceptors for auth token injection)
```

### 2.2 Backend

```
Next.js API Routes (/app/api/*) — one per surface, REST endpoints
Firebase Firestore            — real-time database (shared across all 4 apps)
Firebase Storage              — inspection photos, signatures, invoices
Firebase Auth                 — email/password authentication
```

### 2.3 Monorepo Structure

```
nrn-demo/
├── packages/
│   └── shared/               ← SINGLE SOURCE OF TRUTH for all types/constants/utils
│       ├── types/
│       │   ├── case.ts        ← CaseStatus enum, Case, Vehicle, Estimate, etc.
│       │   ├── user.ts        ← UserRole enum, User
│       │   └── index.ts
│       ├── constants/
│       │   ├── caseStatuses.ts
│       │   └── slaConfig.ts
│       └── utils/
│           ├── caseHelpers.ts
│           └── dateHelpers.ts
├── apps/
│   ├── customer/             ← port 3001
│   ├── workshop/             ← port 3002
│   ├── admin/                ← port 3003
│   └── ops/                  ← port 3004
├── firebase.config.ts        ← shared Firebase init (imported by all apps)
├── turbo.json
└── package.json
```

---

## 3. SHARED DATA MODEL (packages/shared/types/)

### 3.1 Core Types

```typescript
// case.ts
export enum CaseStatus {
  ACCIDENT_REPORTED    = 'ACCIDENT_REPORTED',
  WORKSHOP_SELECTION   = 'WORKSHOP_SELECTION',
  ASSIGNMENT_PENDING   = 'ASSIGNMENT_PENDING',
  REJECTED_REASSIGN    = 'REJECTED_REASSIGN',
  APPOINTMENT_SCHEDULED = 'APPOINTMENT_SCHEDULED',
  VEHICLE_RECEIVED     = 'VEHICLE_RECEIVED',
  UNDER_INSPECTION     = 'UNDER_INSPECTION',
  ESTIMATE_PENDING     = 'ESTIMATE_PENDING',
  ESTIMATE_APPROVED    = 'ESTIMATE_APPROVED',
  PARTS_PENDING        = 'PARTS_PENDING',
  REPAIR_IN_PROGRESS   = 'REPAIR_IN_PROGRESS',
  REPAIR_COMPLETED     = 'REPAIR_COMPLETED',
  READY_FOR_PICKUP     = 'READY_FOR_PICKUP',
  DELIVERED            = 'DELIVERED',
  INVOICE_PENDING      = 'INVOICE_PENDING',
  CLOSED               = 'CLOSED',
  CANCELLED            = 'CANCELLED',
}

export enum UserRole {
  CUSTOMER  = 'customer',
  ADVISOR   = 'advisor',
  OWNER     = 'owner',
  OPERATOR  = 'operator',
}

export interface Vehicle {
  plate: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  color: string;
}

export interface SlaTimer {
  stage: CaseStatus;
  startedAt: Timestamp;
  targetAt: Timestamp;        // startedAt + SLA config for that stage
  status: 'on_track' | 'at_risk' | 'breached';
}

export interface Case {
  id: string;
  customerId: string;
  vehicle: Vehicle;
  accidentRef: string;
  status: CaseStatus;
  assignedWorkshopId: string | null;
  appointmentSlotId: string | null;
  slaTimers: SlaTimer[];
  auditLog: AuditEntry[];    // every status change logged
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AuditEntry {
  status: CaseStatus;
  actorId: string;
  actorRole: UserRole;
  timestamp: Timestamp;
  reason?: string;
}

export interface Workshop {
  id: string;
  name: string;
  nameAr: string;
  location: { lat: number; lng: number; address: string };
  services: ServiceType[];
  rating: number;
  score: number;            // composite score for ranking engine
  status: 'active' | 'suspended';
  capacity: CapacityConfig;
  photos: string[];
}

export interface CapacityConfig {
  bays: number;
  technicians: number;
  maxConcurrentJobs: number;
  workingHours: { [day: string]: { open: string; close: string } | null };
  blackoutDates: string[];
}

export interface Slot {
  id: string;
  workshopId: string;
  date: string;             // YYYY-MM-DD
  timeWindow: string;       // e.g. "09:00–12:00"
  capacity: number;
  bookedCount: number;
}

export interface Inspection {
  id: string;
  caseId: string;
  photos: string[];         // 6 angles — URLs from Firebase Storage
  notes: string;
  timestamp: Timestamp;
}

export interface EstimateLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  partNumber?: string;
}

export interface Estimate {
  id: string;
  caseId: string;
  lineItems: EstimateLineItem[];
  total: number;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  reason?: string;
  submittedAt: Timestamp;
}

export interface PartsRequest {
  id: string;
  caseId: string;
  items: { partNumber: string; description: string; qty: number }[];
  supplierId: string;
  quoteStatus: 'pending' | 'quoted' | 'approved' | 'rejected';
  quote?: { total: number; availableAt: string };
}

export interface WorkOrderChecklist {
  id: string;
  caseId: string;
  items: { label: string; done: boolean; technicalNotes?: string }[];
  progress: number;         // 0–100
}

export interface Handover {
  id: string;
  caseId: string;
  type: 'receive' | 'handover';
  signatureImageUrl: string;
  timestamp: Timestamp;
}

export interface Invoice {
  id: string;
  caseId: string;
  amount: number;
  lineItems: EstimateLineItem[];
  approvalStatus: 'pending' | 'approved' | 'rejected';
  submittedAt: Timestamp;
}

export interface Notification {
  id: string;
  recipientId: string;
  recipientRole: UserRole;
  title: string;
  titleAr: string;
  body: string;
  bodyAr: string;
  caseId: string;
  read: boolean;
  createdAt: Timestamp;
}
```

---

## 4. CROSS-CUTTING REQUIREMENTS (APPLY TO ALL FOUR APPS)

### 4.1 Authentication & RBAC

- Email/password auth via Firebase Auth
- Each app only accepts one role: customer (3001), advisor (3002), owner (3003), operator (3004)
- On login, verify `userRole` claim matches expected role; redirect to `/unauthorized` if mismatch
- Persist session in httpOnly cookie; refresh token silently
- Protect all routes with `AuthGuard` HOC that checks session before rendering
- Seed four demo users (one per role) documented in `/DEMO_CREDENTIALS.md`

### 4.2 Idle Timeout with Reason

- Use throttle (lodash) on `mousemove`, `keydown`, `scroll` to reset idle timer
- If idle for **5 minutes**, show a full-screen modal: "You were logged out due to 5 minutes of inactivity"
- After 10 seconds of modal, redirect to `/login`
- The reason must be visible so the client can see it during the demo

### 4.3 Notifications

- **Bell icon** in top-right of every surface with unread count badge (Framer Motion bounce on new notification)
- **Browser push notification** (Web Push API, request permission on first login)
- Notifications are written to Firestore `notifications` collection by API routes when case status changes
- TanStack Query `useQuery` with Firestore `onSnapshot` for real-time bell updates
- Notification panel slides in from the right (Framer Motion slide + fade)
- Notification matrix (who gets notified per event):
  - New assignment → Workshop + Ops
  - Workshop accepted / appointment set → Customer + Ops
  - Vehicle received → Customer + Ops
  - Estimate submitted → Ops only
  - Estimate approved/rejected → Customer + Workshop
  - Ready for pickup → Customer
  - Delivered / Closed → Customer + Workshop + Ops
  - SLA at-risk / breached → Workshop + Ops

### 4.4 Localization (i18next)

- Languages: English (LTR) and Arabic (RTL)
- Toggle in header saves preference to localStorage
- RTL flips entire layout using `dir` attribute on `<html>`
- All labels, toasts, errors, and notification text have `en` and `ar` keys
- Translation files in `/public/locales/{en,ar}/common.json` per app
- Arabic is the secondary language; English is default

### 4.5 Dark Mode / Light Mode

- `next-themes` with system default
- Toggle in header persists to localStorage
- All shadcn components and custom components must respond correctly to both themes
- Dark mode tokens defined in `tailwind.config.ts` using CSS variables

### 4.6 User Profile

- Avatar + name in top-right header dropdown
- Profile page: edit display name, change password, language preference, notification preferences
- Upload profile photo (Firebase Storage)

### 4.7 Upload & Export

- File uploads: drag-and-drop + click-to-select using a shared `<FileUpload>` component
  - Accepted types: images (JPG, PNG, WebP) and PDF
  - Progress bar during upload to Firebase Storage
  - Preview thumbnails after upload
- Export: TanStack Table views with a visible "Export CSV" / "Export PDF" button
  - CSV: client-side generation using `papaparse`
  - PDF: `jspdf` + `jspdf-autotable`

### 4.8 Debounce & Throttle

- **Debounce (300ms)**: all server-side search inputs (workshop search, case search, parts catalog search)
- **Throttle**: idle detection (see 4.2), scroll-based animations, real-time SLA timer updates

### 4.9 Animations (Framer Motion + GSAP)

- Page transitions: fade + slight Y translate (0.25s ease)
- Status badge changes: scale bounce (0.3s spring)
- Case timeline stagger reveal on mount (50ms per step)
- SLA timer color pulse when at-risk (CSS animation, red glow)
- Mobile app-like sheet/drawer transitions for action panels
- GSAP ScrollTrigger for the Operations Console SLA board

### 4.10 Code Quality Rules

- **TDD**: every API route has a corresponding Jest test file (`*.test.ts`) before implementation
- **`test:ts`** script in each `package.json`: `"test:ts": "tsc --noEmit"` — runs TypeScript type checks without emitting files
- **Code splitting**: each page uses `dynamic()` import for heavy components (tables, charts, signature pads)
- **Clean code**: max 200 lines per file; extract hooks into `/hooks/`, utilities into `/lib/`
- **No `any`**: TypeScript strict mode enabled in all `tsconfig.json`
- **Single source of truth**: all status constants imported from `packages/shared`, never hardcoded per-app
- Barrel exports (`index.ts`) for every feature folder

---

## 5. SURFACE 1 — CUSTOMER APP (port 3001)

### 5.1 Sitemap

```
/login
/accidents                    ← Accident List (home)
/accidents/[id]               ← Case Detail + Tracker
/accidents/[id]/workshops     ← Workshop Discovery
/accidents/[id]/workshops/[workshopId]  ← Workshop Detail
/accidents/[id]/slots         ← Slot Picker
/profile
/notifications
/unauthorized
```

### 5.2 Screens & Behaviour

#### `/login`
- Email + password fields (React Hook Form + Zod: email format, min 6 chars password)
- Shows validation errors inline
- On success: redirect to `/accidents`

#### `/accidents` — Accident List
- Mobile card list of all cases for the logged-in customer
- Each card shows: vehicle plate + model, incident date, **status chip** (label from lifecycle table, e.g. "Accident reported", "Workshop booked", "Under repair")
- Status chip colour: grey → blue (active steps) → green (CLOSED) → red (CANCELLED)
- Framer Motion stagger on initial load (each card 50ms delay)
- **"Find workshops" CTA button** appears when `status === WORKSHOP_SELECTION`
- Tapping a card with `status >= APPOINTMENT_SCHEDULED` → `/accidents/[id]` Case Detail

#### `/accidents/[id]` — Case Detail + Live Tracker
- Timeline component showing all 16 lifecycle steps
- Current step highlighted with animated pulse ring
- Past steps: green check + timestamp
- Future steps: grey
- Workshop info card (name, address, "Get Directions" link) appears after `APPOINTMENT_SCHEDULED`
- Appointment date/time badge visible
- **Cancel booking** button (visible until `VEHICLE_RECEIVED`): opens bottom sheet with reason dropdown (Booked by mistake / Found another workshop / Long wait / Other) + confirm; sets `status = CANCELLED`
- **Rate workshop** prompt appears when `status === CLOSED` (1–5 stars)
- Real-time via Firestore `onSnapshot` on the Case document

#### `/accidents/[id]/workshops` — Workshop Discovery
- List of active workshops filtered by damage type matching the accident
- Each card: workshop name, Najm-Verified badge, rating (⭐ 4.3), estimated wait (Available / 1 day / 1 week / Busy), service tags
- Filters bar: All / Open Now / Top Rated / Nearest (TanStack Table filter logic)
- Debounced search input
- Tapping a card → Workshop Detail

#### `/accidents/[id]/workshops/[workshopId]` — Workshop Detail
- Workshop name, Najm-Verified badge, star rating + review count
- Map embed (static Google Maps iframe with pin)
- Services list (denting, painting, mechanic, etc.)
- "Select Workshop" primary button → navigates to Slot Picker

#### `/accidents/[id]/slots` — Slot Picker
- Calendar grid showing available slots published by the Admin Panel
- Each slot shows: date + time window + remaining capacity indicator
- Selecting a slot + confirming:
  - Calls `/api/cases/[id]/book` → sets `status = ASSIGNMENT_PENDING`, writes booking to Firestore
  - Shows success toast ("Workshop booked — confirming…")
  - Redirects to Case Detail

---

## 6. SURFACE 2 — WORKSHOP APP (port 3002)

### 6.1 Sitemap

```
/login
/orders                       ← Order Queue (Karage Kash list)
/orders/[id]                  ← Order Detail hub
/orders/[id]/receive          ← Receive Car (drop-off + signature)
/orders/[id]/inspection       ← Vehicle Inspection (6 photos + notes)
/orders/[id]/items            ← Add Items (parts catalog)
/orders/[id]/review           ← Review Items + Submit Estimate
/orders/[id]/work-order       ← Work Order Checklist
/orders/[id]/handover         ← Vehicle Handover (signature)
/orders/[id]/invoice          ← Submit Invoice
/profile
/notifications
/unauthorized
```

### 6.2 Screens & Behaviour

#### `/orders` — Order Queue
- Mobile card list of all cases assigned to this workshop
- Status filter tabs: All | Under Service | Pending Parts | Approved | Ready for Pickup
- Each card: customer name, vehicle plate, car model + year, status badge, **SLA countdown badge** (time remaining in current stage; turns amber at 80%, red at breach)
- **New car from Najm** — incoming assignment triggers a full-screen bottom sheet modal:
  - Shows accident summary (vehicle, incident date, damage type, accident reference)
  - Two large buttons: **Accept** (green) / **Reject** (red)
  - On Reject: mandatory reason field (text input, min 10 chars)
  - Accept → calls `/api/cases/[id]/accept` → status transitions to `APPOINTMENT_SCHEDULED`; modal animates away
  - Reject → calls `/api/cases/[id]/reject` → status goes to `REJECTED_REASSIGN`

#### `/orders/[id]` — Order Detail Hub
- Summary card (vehicle, customer, appointment)
- Action buttons grid (context-aware, only show what's valid for current status):
  - Receive Car (status = `APPOINTMENT_SCHEDULED`)
  - Start Inspection (status = `VEHICLE_RECEIVED`)
  - Add Items (status = `UNDER_INSPECTION`)
  - Review & Submit (status = `UNDER_INSPECTION` after items added)
  - Start Job (status = `ESTIMATE_APPROVED`)
  - Mark Ready (status = `REPAIR_COMPLETED`)
  - Handover (status = `READY_FOR_PICKUP`)
  - Submit Invoice (status = `DELIVERED`)

#### `/orders/[id]/receive` — Receive Car
- Shows the Najm accident report (read-only summary card)
- Signature pad (canvas-based, clear + save buttons)
- On save signature: upload to Firebase Storage, call `/api/cases/[id]/receive` → status = `VEHICLE_RECEIVED`

#### `/orders/[id]/inspection` — Vehicle Inspection (DVI)
- 6 photo capture slots: Front, Rear, Driver Side, Passenger Side, Interior, Roof
- Each slot: upload button (camera icon) + preview thumbnail after upload
- Free-text notes field
- Photos upload to Firebase Storage with timestamp in filename
- "Next" button only enabled when all 6 photos uploaded
- On submit: calls `/api/cases/[id]/inspection` → status = `UNDER_INSPECTION`

#### `/orders/[id]/items` — Add Items (Parts Catalog)
- Searchable parts catalog (debounced, 300ms) — seeded static catalog in Firestore
- Each part: part number, description, unit price
- Quantity stepper (+/-)
- "Add to order" button
- Running subtotal in sticky footer
- Out-of-stock items flagged with "Request from Supplier" badge
- "Done" → navigate to Review Items

#### `/orders/[id]/review` — Review Items + Submit Estimate
- Summary table of selected parts (using TanStack Table: sortable, removable rows)
- Inspection notes shown (read-only)
- Total amount prominently displayed
- "Submit Estimate to Najm" button:
  - Validates at least one line item
  - Calls `/api/cases/[id]/estimate` → writes Estimate doc, status = `ESTIMATE_PENDING`
  - Also calls `/api/cases/[id]/parts-request` if out-of-stock items exist → status flag `PARTS_PENDING`
  - Shows success state with animation

#### `/orders/[id]/work-order` — Work Order Checklist
- Checklist items: Re-assembling / Body Fixing / Painting / Final Assembly (seeded)
- Each item: checkbox + optional technician notes textarea
- Progress bar (Framer Motion animated width)
- "Complete All & Mark Ready" button — only appears when all items are checked
- Calls `/api/cases/[id]/complete` → status = `READY_FOR_PICKUP`

#### `/orders/[id]/handover` — Vehicle Handover
- Summary of services performed
- Legal text block (RTL/LTR)
- Customer signature pad (same component as receive)
- On save: upload signature, call `/api/cases/[id]/deliver` → status = `DELIVERED`

#### `/orders/[id]/invoice` — Submit Invoice
- Invoice form: line items (pre-filled from estimate), amounts, final total
- PDF preview pane
- "Submit Invoice to Najm" → calls `/api/cases/[id]/invoice` → status = `INVOICE_PENDING`

---

## 7. SURFACE 3 — WORKSHOP ADMIN PANEL (port 3003)

### 7.1 Sitemap

```
/login
/dashboard                    ← Overview KPIs + Availability toggle
/profile                      ← Workshop profile (name, location, services)
/capacity                     ← Service bays, technicians, max concurrent jobs
/schedule                     ← Working hours + blackout dates
/slots                        ← Daily slot management calendar
/bookings                     ← Booking inbox + appointment calendar
/team                         ← Staff management
/performance                  ← KPI dashboard
/settings
/notifications
/unauthorized
```

### 7.2 Screens & Behaviour

#### `/dashboard` — Overview
- KPI cards: Active jobs, Today's appointments, SLA compliance %, Average rating
- **Availability toggle**: Open / Busy / Temporarily Closed (large toggle, updates Firestore instantly)
- **Wait-time estimate** auto-calculated badge: queue depth ÷ capacity → "~1 hour", "~1 day", "~1 week"
- Recent bookings table (last 5)

#### `/profile` — Workshop Profile
- Editable form: name (EN + AR), location pin on map, contact number, photos gallery
- **Service capabilities checklist**: Denting / Painting / Mechanic / Tires / Battery / Glass / AC / Electrical
- Saving updates Firestore `workshops/[id]` doc
- Service selection controls which cases this workshop is eligible to receive (capability filter)

#### `/capacity` — Capacity Configuration
- Number inputs: Service bays, Technicians, Max concurrent jobs
- These values power the wait-time calculation and Available/Busy chip in the Customer App
- Save → updates `workshops/[id].capacity`

#### `/schedule` — Working Hours
- Grid: 7 days × open/close time inputs
- Toggle per day (enabled / holiday)
- Date picker for blackout dates (e.g. national holidays)
- "Open Now" label in Customer App is computed from this data

#### `/slots` — Daily Slot Management
- Monthly calendar view
- Click a day → side panel opens: set number of available bookings for that day (per service type optional)
- Each customer booking consumes one slot (bookedCount increments)
- Day cell shows: total slots / booked / remaining
- Auto-marks day as Busy when remaining = 0

#### `/bookings` — Booking Inbox
- Two-panel layout: left = incoming bookings list, right = weekly appointment calendar
- Each incoming booking card: customer name, vehicle, accident ref, requested time window
- Accept / Decline buttons on each card (mirrors Workshop App WS-02 for web context)
- Accepted bookings appear on the calendar

#### `/team` — Staff Management
- TanStack Table: list of advisors and technicians
- Multi-select + bulk assign to case
- Add member form (name, role, contact)

#### `/performance` — KPIs
- Line chart: jobs completed per week (last 12 weeks)
- Stat cards: avg turnaround days, SLA compliance %, acceptance rate, current rating
- Export as CSV/PDF buttons

---

## 8. SURFACE 4 — NRN OPERATIONS CONSOLE (port 3004)

### 8.1 Sitemap

```
/login
/dashboard                    ← Overview metrics
/cases                        ← Case Management (master list)
/cases/[id]                   ← Case Detail (drill-down)
/approvals                    ← Estimate / Parts / Invoice approvals queue
/sla                          ← SLA board (live timers)
/escalations                  ← Escalation queue
/network                      ← Workshop network management
/network/[workshopId]         ← Workshop detail + scoring
/integrations                 ← Webhook/sync log
/notifications
/profile
/unauthorized
```

### 8.2 Screens & Behaviour

#### `/dashboard` — Overview
- Real-time stat cards: Total active cases, Pending approvals, SLA breaches today, Network size
- Bar chart: cases by status
- Recent activity feed (last 10 audit log entries across all cases)

#### `/cases` — Case Management
- Full TanStack Table:
  - Columns: Case ID, Customer, Vehicle, Workshop, Status, SLA status, Created, Last updated
  - Multi-select rows with bulk actions: Reassign, Cancel, Export
  - Column sort (all columns)
  - Column filters: status multi-select, date range, workshop dropdown
  - Global search (debounced, searches case ID + plate + customer name)
  - Pagination (25 / 50 / 100 per page)
  - Export CSV + Export PDF buttons

#### `/cases/[id]` — Case Detail Drill-Down
- Full audit log timeline (all status changes with actor, role, timestamp, reason)
- Documents panel: inspection photos grid, signature images, estimate PDF
- SLA timer panel: each stage with elapsed / remaining / status
- Manual override actions (Ops only): Reassign workshop, Force status, Cancel with reason

#### `/approvals` — Approval Queue
- Three tabs: Estimates | Parts Quotes | Invoices
- Each approval card shows:
  - **Estimates**: case ID, workshop, vehicle, line items table, total amount → **Approve** / **Reject with reason**
    - Approve → calls `/api/cases/[id]/approve-estimate` → status = `ESTIMATE_APPROVED`
  - **Parts Quotes**: supplier name, items, quote total → Approve / Reject
  - **Invoices**: case ID, invoice amount, services rendered → Approve (→ `CLOSED`) / Reject
- All approvals record: actorId, timestamp, decision, reason in audit log

#### `/sla` — SLA Board
- Kanban-style board with columns: On Track | At Risk | Breached
- Each case card shows: case ID, current stage, elapsed time, time remaining countdown timer
- GSAP ScrollTrigger animation when cards move between columns
- SLA thresholds (configurable, demo defaults):
  - Accept ≤ 2 hours
  - Vehicle received ≤ 4 hours
  - Inspection ≤ 24 hours
  - Estimate submitted ≤ 48 hours
  - Repair ≤ 7 days
- Timer ticks every second via `setInterval` + Firestore `slaTimers` field
- At-risk: 80% of time elapsed → amber; Breached: 100% → red pulse animation

#### `/escalations` — Escalation Queue
- List of breached cases that auto-escalated
- Action buttons: Reassign workshop, Notify workshop, Dismiss (with reason)

#### `/network` — Workshop Network
- TanStack Table of all workshops: name, services, status (active/suspended), score, current load, rating
- Toggle workshop active/suspended (OPS-09)
- Composite score displayed: proximity + availability + ranking − current_load formula visible in tooltip
- "Add Workshop" button → inline form in side panel

#### `/network/[workshopId]` — Workshop Scoring Detail
- Score breakdown chart (radar chart: proximity, availability, ranking, load)
- Historical performance: jobs, SLA compliance, acceptance rate, rating trend
- Manual score override input (Ops-only)

#### `/integrations` — Webhook Log
- Table of outbound webhook events (claim status sync stubs)
- Status: sent / failed / pending
- Manual retry button on failed events

---

## 9. API ROUTES (ONE SET PER APP, FIRESTORE-BACKED)

All routes follow REST conventions. Each route that mutates state must:
1. Validate the body with Zod schema
2. Check that the current case status is a valid predecessor (state machine guard)
3. Write to Firestore
4. Write a `notifications` document for each recipient per the notification matrix (§4.3)
5. Write an `auditLog` entry (actor, role, timestamp, reason)
6. Return `{ success: true, data: updatedCase }` or `{ error: string, code: number }`

### Core Case Mutation Routes

```
POST /api/cases/[id]/book              → ASSIGNMENT_PENDING
POST /api/cases/[id]/accept            → APPOINTMENT_SCHEDULED
POST /api/cases/[id]/reject            → REJECTED_REASSIGN (body: { reason })
POST /api/cases/[id]/receive           → VEHICLE_RECEIVED (body: { signatureUrl })
POST /api/cases/[id]/inspection        → UNDER_INSPECTION (body: { photos[], notes })
POST /api/cases/[id]/estimate          → ESTIMATE_PENDING (body: { lineItems[] })
POST /api/cases/[id]/approve-estimate  → ESTIMATE_APPROVED (body: { approvedBy })
POST /api/cases/[id]/reject-estimate   → back to UNDER_INSPECTION (body: { reason })
POST /api/cases/[id]/parts-request     → PARTS_PENDING flag
POST /api/cases/[id]/start             → REPAIR_IN_PROGRESS
POST /api/cases/[id]/complete          → READY_FOR_PICKUP
POST /api/cases/[id]/deliver           → DELIVERED (body: { handoverSignatureUrl })
POST /api/cases/[id]/invoice           → INVOICE_PENDING (body: { amount, lineItems[] })
POST /api/cases/[id]/approve-invoice   → CLOSED
POST /api/cases/[id]/cancel            → CANCELLED (body: { reason })
```

### Supporting Routes

```
GET  /api/workshops                    → list (filters: services, status, availability)
GET  /api/workshops/[id]/slots         → available slots for date range
POST /api/workshops/[id]/slots         → create slot (Admin Panel)
GET  /api/cases                        → list (role-scoped: customer sees own, workshop sees assigned, ops sees all)
GET  /api/cases/[id]                   → single case with all sub-collections
GET  /api/notifications                → for current user (unread first)
POST /api/notifications/[id]/read      → mark as read
GET  /api/approvals                    → pending estimates + invoices (ops only)
POST /api/workshops/[id]/availability  → toggle open/busy/closed (admin only)
```

---

## 10. SEEDED DEMO DATA

Create a script at `/scripts/seed.ts` that populates Firestore with:

### Users (one per role)
```
customer@nrn.demo    / Demo1234!  → role: customer
advisor@nrn.demo     / Demo1234!  → role: advisor (workshopId: ws_001)
owner@nrn.demo       / Demo1234!  → role: owner   (workshopId: ws_001)
operator@nrn.demo    / Demo1234!  → role: operator
```

### One Workshop (`ws_001`)
```
Name: Al-Faris Auto Center / مركز الفارس للسيارات
Location: Riyadh, Saudi Arabia (lat: 24.7136, lng: 46.6753)
Services: [denting, painting, mechanic]
Status: active
Rating: 4.7
Capacity: { bays: 8, technicians: 12, maxConcurrentJobs: 6 }
Working hours: Sun–Thu 08:00–18:00, Fri–Sat closed
Slots: next 14 days, 6 slots/day, 0 booked
```

### One Case (`case_001`) — at status `WORKSHOP_SELECTION`
```
Customer: customer@nrn.demo
Vehicle: { plate: "ABC 1234", make: "Toyota", model: "Camry", year: 2022, vin: "JT2BF22K1W0066777", color: "Silver" }
AccidentRef: "NJM-2026-00001"
Status: WORKSHOP_SELECTION
AssignedWorkshopId: null
```

The demo flow uses **this one case** moving through all statuses step by step.

---

## 11. HAPPY-PATH DEMO FLOW (STEP BY STEP)

This is the sequence a presenter follows to demo the system. Each step is a UI action on a specific surface:

| Step | Surface (port) | Action | Resulting Status |
|------|---------------|--------|-----------------|
| 1 | Customer (3001) | Login → Accident List → see `case_001` with "Find workshops" CTA | `WORKSHOP_SELECTION` |
| 2 | Customer (3001) | Tap "Find workshops" → browse list → tap Al-Faris → "Select Workshop" → pick a slot → confirm | `ASSIGNMENT_PENDING` |
| 3 | Workshop (3002) | Login → New car popup appears → review accident → **Accept** → confirm slot | `APPOINTMENT_SCHEDULED` |
| 4 | Customer (3001) | Case Detail refreshes in real-time → shows appointment date/time | (same) |
| 5 | Workshop (3002) | Customer arrives → tap "Receive Car" → view Najm report → draw signature → save | `VEHICLE_RECEIVED` |
| 6 | Workshop (3002) | Tap "Start Inspection" → upload 6 photos → add notes → submit | `UNDER_INSPECTION` |
| 7 | Workshop (3002) | Tap "Add Items" → search catalog → add parts → tap "Review" → submit estimate to Najm | `ESTIMATE_PENDING` |
| 8 | Ops Console (3004) | Login → Approvals tab → see estimate → review line items → **Approve** | `ESTIMATE_APPROVED` |
| 9 | Workshop (3002) | Case refreshes → "Start Job" button enabled → tap Start Job | `REPAIR_IN_PROGRESS` |
| 10 | Workshop (3002) | Tap Work Order → check all checklist items → tap "Mark Ready for Pickup" | `READY_FOR_PICKUP` |
| 11 | Customer (3001) | Push notification arrives: "Your car is ready for pickup" → Case shows "Ready for pickup" | (same) |
| 12 | Workshop (3002) | Customer arrives → Tap "Handover" → draw customer signature → save | `DELIVERED` |
| 13 | Workshop (3002) | Tap "Submit Invoice" → review amounts → submit to Najm | `INVOICE_PENDING` |
| 14 | Ops Console (3004) | Approvals → Invoice tab → review → **Approve** | `CLOSED` |
| 15 | Customer (3001) | Case shows "Closed" → rate workshop prompt appears | `CLOSED` |

---

## 12. DESIGN SYSTEM & VISUAL DIRECTION

### Design Identity
- **Product name**: NRN / Najm Repair Network
- **Aesthetic**: Premium automotive industry — clean, trustworthy, professional. Dark navy + electric gold accents. Saudi/Arab market: supports RTL elegantly.
- **Font pairing**: `IBM Plex Sans Arabic` (primary, RTL support) + `DM Mono` (case IDs, status codes, SLA timers)
- **Color tokens** (CSS variables, both light and dark mode):
  ```css
  --brand-primary: #1A3C5E;      /* deep navy */
  --brand-accent:  #F0A500;      /* golden amber */
  --status-active: #3B82F6;      /* blue */
  --status-done:   #22C55E;      /* green */
  --status-warn:   #F59E0B;      /* amber */
  --status-danger: #EF4444;      /* red */
  --status-closed: #6B7280;      /* grey */
  ```
- **Status chips**: pill-shaped, colour-coded, with animated transition when status changes (scale + colour cross-fade)
- **Mobile apps** (Customer + Workshop): bottom navigation bar, card-based layouts, generous padding, touch-target minimum 44px
- **Web apps** (Admin + Ops Console): sidebar navigation (collapsible), header with breadcrumbs, data-dense tables with zebra striping

### shadcn Components to Use
- `Card`, `Button`, `Badge`, `Dialog`, `Sheet`, `Tabs`, `Table`, `Input`, `Select`, `Checkbox`, `RadioGroup`, `Popover`, `Calendar`, `Progress`, `Avatar`, `DropdownMenu`, `Separator`, `Skeleton` (for loading states), `Toast` (Sonner)

---

## 13. FILE STRUCTURE PER APP

Each of the four apps follows this structure:

```
apps/[app-name]/
├── app/
│   ├── layout.tsx              ← theme provider, i18n, auth guard, idle timer
│   ├── page.tsx                ← redirect to /login or home
│   ├── login/page.tsx
│   ├── [feature]/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   └── api/
│       └── [...routes]
├── components/
│   ├── ui/                     ← shadcn auto-generated
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx          ← web apps only
│   │   ├── BottomNav.tsx        ← mobile apps only
│   │   └── NotificationPanel.tsx
│   ├── case/
│   │   ├── CaseCard.tsx
│   │   ├── CaseTimeline.tsx
│   │   ├── StatusBadge.tsx
│   │   └── SlaTimer.tsx
│   └── shared/
│       ├── FileUpload.tsx
│       ├── SignaturePad.tsx
│       └── IdleModal.tsx
├── hooks/
│   ├── useCase.ts              ← TanStack Query + Firestore onSnapshot
│   ├── useNotifications.ts
│   ├── useIdleTimer.ts
│   └── useAuth.ts
├── lib/
│   ├── firebase.ts             ← Firebase init
│   ├── axios.ts                ← Axios instance with interceptors
│   ├── queryClient.ts
│   └── i18n.ts
├── public/
│   └── locales/
│       ├── en/common.json
│       └── ar/common.json
├── __tests__/
│   └── api/                    ← Jest tests for every API route
├── package.json                ← includes "test:ts": "tsc --noEmit"
└── tsconfig.json               ← strict: true
```

---

## 14. EXECUTION ORDER FOR THE AGENT

Execute these phases **sequentially**. Do not proceed to the next phase until the current one compiles and passes `npm run test:ts`:

### Phase 1 — Scaffold & Shared Package
1. Initialize Turborepo monorepo with pnpm workspaces
2. Create `packages/shared` with all types, enums, constants, SLA config
3. Configure Firebase project (Firestore, Storage, Auth) — use environment variables in `.env.local`
4. Write `scripts/seed.ts` and run it to populate demo data
5. Write `DEMO_CREDENTIALS.md`

### Phase 2 — NRN Operations Console (port 3004) FIRST
Build Ops Console first because it owns approvals — the demo needs it running to unblock the happy path.
1. Auth + RBAC (operator role)
2. Sidebar layout + dark/light/RTL
3. `/cases` with full TanStack Table
4. `/approvals` (estimate + invoice approval)
5. `/sla` board with live timers
6. All API routes for approval actions
7. Notifications (bell + push)
8. Jest tests for all API routes

### Phase 3 — Workshop Admin Panel (port 3003)
1. Auth + RBAC (owner role)
2. Sidebar layout
3. `/dashboard` with availability toggle
4. `/profile`, `/capacity`, `/schedule`
5. `/slots` calendar
6. `/bookings` inbox
7. `/performance` KPIs

### Phase 4 — Workshop App (port 3002)
1. Auth + RBAC (advisor role)
2. Mobile layout + bottom nav
3. `/orders` queue with new-car popup
4. All workflow screens: receive → inspect → items → review → work-order → handover → invoice
5. All corresponding API routes
6. SLA countdown badges

### Phase 5 — Customer App (port 3001)
1. Auth + RBAC (customer role)
2. Mobile layout + bottom nav
3. `/accidents` list
4. Workshop discovery + slot picker
5. Case detail + live tracker timeline
6. Cancel booking flow

### Phase 6 — Integration & Demo Polish
1. Verify real-time propagation across all 4 surfaces for every status transition
2. Verify all push notifications fire correctly per matrix
3. Add Framer Motion page transitions to all apps
4. Add GSAP animations to SLA board
5. Verify RTL layout is correct on all screens when language = Arabic
6. Verify dark mode on all screens
7. Run `pnpm run test:ts` across all packages — zero errors
8. Run `pnpm test` — all Jest tests pass
9. Write `README.md` with: startup instructions, demo flow walkthrough, credentials

---

## 15. README REQUIREMENTS

The generated `README.md` must include:

```markdown
# NRN Demo

## Quick Start
pnpm install
cp .env.example .env.local   # fill in Firebase credentials
pnpm run seed                # seeds demo data
pnpm run dev                 # starts all 4 apps in parallel

## Surfaces
| Surface | URL | Login |
|---------|-----|-------|
| Customer App | http://localhost:3001 | customer@nrn.demo / Demo1234! |
| Workshop App | http://localhost:3002 | advisor@nrn.demo / Demo1234! |
| Workshop Admin | http://localhost:3003 | owner@nrn.demo / Demo1234! |
| NRN Ops Console | http://localhost:3004 | operator@nrn.demo / Demo1234! |

## Demo Flow (Happy Path)
[step-by-step table from §11]

## Architecture
[diagram of 4 apps sharing Firestore]
```

---

## 16. DEFINITION OF DONE

The demo is complete when:

- [ ] All four apps run simultaneously on ports 3001–3004
- [ ] Login works for all four demo credentials
- [ ] Idle timeout fires at 5 min with visible reason message
- [ ] The happy-path flow from §11 completes without manual database edits
- [ ] Every status change in one app is reflected in real-time in all other apps (within 2 seconds)
- [ ] Notifications appear in bell icon and browser push on correct events
- [ ] All forms validate with inline errors (React Hook Form + Zod)
- [ ] Language toggle switches between English and Arabic, RTL flips correctly
- [ ] Dark/light mode toggle works on all screens
- [ ] TanStack Table on Ops Console shows sort, filter, multi-select, pagination, and CSV export
- [ ] SLA board shows live countdown timers that pulse red when breached
- [ ] `pnpm run test:ts` passes with zero TypeScript errors
- [ ] At least one Jest test exists for every API route

---

*End of CLAUDE.md — Begin building.*

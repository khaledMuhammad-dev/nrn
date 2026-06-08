# Najm Repair Network (NRN) — Demo

Full-stack insurance-to-repair platform built as a Turborepo monorepo with four independent Next.js 14 applications connected to a shared Firebase Firestore backend.

## Architecture

| App | Port | Role |
|-----|------|------|
| `apps/customer` | 3001 | Customer mobile-web (accident reporting, workshop selection, case tracking) |
| `apps/workshop` | 3002 | Workshop service advisor (accept/reject, vehicle receive, inspection, estimate, handover) |
| `apps/admin` | 3003 | Workshop owner panel (capacity, schedule, team, KPIs) |
| `apps/ops` | 3004 | NRN operations console (approvals, SLA board, escalations, network) |

## Prerequisites

- Node.js 18+
- pnpm 8+
- A Firebase project with Firestore enabled

## Quick Start

```bash
# Install dependencies
pnpm install

# Populate .env.local with your Firebase credentials (see .env.example)
# Then seed Firestore with demo data:
pnpm run seed

# Start all four apps simultaneously
pnpm run dev
```

Apps start on ports 3001–3004. Open four browser tabs.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

FIREBASE_ADMIN_PROJECT_ID=...
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_ADMIN_CLIENT_EMAIL=...
```

The seed script automatically enables Email/Password authentication in the Firebase project when first run.

## Demo Credentials

| Role | Email | Password | App |
|------|-------|----------|-----|
| Customer | customer@nrn.demo | Demo1234! | http://localhost:3001 |
| Service Advisor | advisor@nrn.demo | Demo1234! | http://localhost:3002 |
| Workshop Owner | owner@nrn.demo | Demo1234! | http://localhost:3003 |
| NRN Operator | operator@nrn.demo | Demo1234! | http://localhost:3004 |

## Happy-Path Flow (15 Steps)

Follow these steps across the four apps to demonstrate the complete case lifecycle:

| Step | Actor | App | Action |
|------|-------|-----|--------|
| 1 | Customer | :3001 | Login → see case `case_001` at WORKSHOP_SELECTION |
| 2 | Customer | :3001 | Tap "Find Workshops" → browse Al-Faris Auto Center |
| 3 | Customer | :3001 | Select workshop → choose a time slot → confirm booking |
| 4 | Advisor | :3002 | Login → new booking notification → Accept |
| 5 | Customer | :3001 | Case updates to APPOINTMENT_SCHEDULED in real time |
| 6 | Advisor | :3002 | Vehicle arrives → "Receive Vehicle" → sign on signature pad |
| 7 | Advisor | :3002 | Upload 6 inspection photos → submit inspection |
| 8 | Advisor | :3002 | Select parts from catalog → submit estimate |
| 9 | Operator | :3004 | Login → Approvals → review estimate → Approve |
| 10 | Customer | :3001 | Case updates to ESTIMATE_APPROVED in real time |
| 11 | Advisor | :3002 | Start repair → work-order checklist → mark all done → Mark Ready |
| 12 | Advisor | :3002 | Handover → customer signs → deliver vehicle |
| 13 | Advisor | :3002 | Submit invoice |
| 14 | Operator | :3004 | Approvals → Invoices tab → Approve invoice → case moves to CLOSED |
| 15 | Customer | :3001 | Case shows CLOSED → rate the workshop |

## State Machine

```
ACCIDENT_REPORTED → WORKSHOP_SELECTION → ASSIGNMENT_PENDING
  → [reject] REJECTED_REASSIGN → ASSIGNMENT_PENDING
  → [accept] APPOINTMENT_SCHEDULED → VEHICLE_RECEIVED → UNDER_INSPECTION
  → ESTIMATE_PENDING → [ops reject] UNDER_INSPECTION
  → [ops approve] ESTIMATE_APPROVED → REPAIR_IN_PROGRESS → REPAIR_COMPLETED
  → READY_FOR_PICKUP → DELIVERED → INVOICE_PENDING → [ops approve] CLOSED
  → CANCELLED (from APPOINTMENT_SCHEDULED only)
```

## Deploy to Netlify

This monorepo ships four separate Next.js apps. Deploy **one Netlify site per app**, all connected to the same Git repository.

| Surface | Base directory | Package filter |
|---------|----------------|----------------|
| Customer | `apps/customer` | `@nrn/customer` |
| Workshop | `apps/workshop` | `@nrn/workshop` |
| Admin | `apps/admin` | `@nrn/admin` |
| Ops | `apps/ops` | `@nrn/ops` |

Each app folder includes a `netlify.toml` with the build command, Node/pnpm versions, and the Next.js plugin.

### Setup (repeat for each site)

1. In [Netlify](https://app.netlify.com), **Add new site → Import an existing project** and connect this repo.
2. Set **Base directory** to the app path (e.g. `apps/customer`). Netlify reads that app’s `netlify.toml`.
3. Under **Site settings → Environment variables**, add every variable from `.env.example`:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `FIREBASE_ADMIN_PROJECT_ID`
   - `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `FIREBASE_ADMIN_PRIVATE_KEY` (paste with `\n` for line breaks)
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_EMAIL`
4. In **Firebase Console → Authentication → Authorized domains**, add each Netlify URL (e.g. `your-site.netlify.app`).
5. Run `pnpm run seed` locally once so Firestore has demo data before demoing production URLs.

### CLI deploy (optional)

```bash
npm install -g netlify-cli
netlify login
cd apps/customer && netlify init && netlify deploy --prod
```

## Running Tests

```bash
# All apps
pnpm run test

# TypeScript type check (zero errors required)
pnpm run test:ts

# Individual app
pnpm --filter customer test
pnpm --filter workshop test
pnpm --filter ops test
pnpm --filter admin test
```

## Key Technical Features

- **Real-time updates** — Firestore `onSnapshot` across all four surfaces; status changes propagate within ~1–2 seconds
- **State machine guard** — every API route calls `isValidTransition()` before mutating case status
- **Role-based auth** — Firebase custom claims (`userRole`) enforced via `AuthGuard` on every page
- **Notification fan-out** — notifications written to Firestore on each status transition, per-role recipient matrix
- **SLA timers** — per-stage countdowns with `on_track / at_risk / breached` states; breached cases surface in Ops escalations
- **Bilingual** — Arabic (RTL) + English (LTR) via i18next; toggle in header switches `html dir`
- **Dark mode** — via `next-themes` + CSS variable design tokens
- **Idle timeout** — 5-minute inactivity → modal → 10-second countdown → auto-logout

## Project Structure

```
nrn/
├── apps/
│   ├── customer/   Next.js 14 — port 3001
│   ├── workshop/   Next.js 14 — port 3002
│   ├── admin/      Next.js 14 — port 3003
│   └── ops/        Next.js 14 — port 3004
├── packages/
│   └── shared/     Types, constants, state machine, utils
├── scripts/
│   └── seed.ts     Firestore seed script
├── .env.local      Firebase credentials (not committed)
└── turbo.json      Turborepo pipeline config
```

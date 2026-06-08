export type Timestamp = { seconds: number; nanoseconds: number } | Date | string;

export enum CaseStatus {
  ACCIDENT_REPORTED     = 'ACCIDENT_REPORTED',
  WORKSHOP_SELECTION    = 'WORKSHOP_SELECTION',
  ASSIGNMENT_PENDING    = 'ASSIGNMENT_PENDING',
  REJECTED_REASSIGN     = 'REJECTED_REASSIGN',
  APPOINTMENT_SCHEDULED = 'APPOINTMENT_SCHEDULED',
  VEHICLE_RECEIVED      = 'VEHICLE_RECEIVED',
  UNDER_INSPECTION      = 'UNDER_INSPECTION',
  ESTIMATE_PENDING      = 'ESTIMATE_PENDING',
  ESTIMATE_APPROVED     = 'ESTIMATE_APPROVED',
  PARTS_PENDING         = 'PARTS_PENDING',
  REPAIR_IN_PROGRESS    = 'REPAIR_IN_PROGRESS',
  REPAIR_COMPLETED      = 'REPAIR_COMPLETED',
  READY_FOR_PICKUP      = 'READY_FOR_PICKUP',
  DELIVERED             = 'DELIVERED',
  INVOICE_PENDING       = 'INVOICE_PENDING',
  CLOSED                = 'CLOSED',
  CANCELLED             = 'CANCELLED',
}

export enum UserRole {
  CUSTOMER = 'customer',
  ADVISOR  = 'advisor',
  OWNER    = 'owner',
  OPERATOR = 'operator',
}

export type ServiceType = 'denting' | 'painting' | 'mechanic' | 'tires' | 'battery' | 'glass' | 'ac' | 'electrical';

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
  targetAt: Timestamp;
  status: 'on_track' | 'at_risk' | 'breached';
}

export interface AuditEntry {
  status: CaseStatus;
  actorId: string;
  actorRole: UserRole;
  timestamp: Timestamp;
  reason?: string;
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
  auditLog: AuditEntry[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  customerRating?: number;
}

export interface CapacityConfig {
  bays: number;
  technicians: number;
  maxConcurrentJobs: number;
  workingHours: { [day: string]: { open: string; close: string } | null };
  blackoutDates: string[];
}

export interface Workshop {
  id: string;
  name: string;
  nameAr: string;
  location: { lat: number; lng: number; address: string };
  services: ServiceType[];
  rating: number;
  score: number;
  status: 'active' | 'suspended';
  capacity: CapacityConfig;
  photos: string[];
  availability?: 'open' | 'busy' | 'closed';
}

export interface Slot {
  id: string;
  workshopId: string;
  date: string;
  timeWindow: string;
  capacity: number;
  bookedCount: number;
}

export interface Inspection {
  id: string;
  caseId: string;
  photos: string[];
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

export interface WorkOrderItem {
  label: string;
  done: boolean;
  technicalNotes?: string;
}

export interface WorkOrderChecklist {
  id: string;
  caseId: string;
  items: WorkOrderItem[];
  progress: number;
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

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  workshopId?: string;
  photoURL?: string;
  language: 'en' | 'ar';
  pushSubscription?: string;
}

export interface Part {
  id: string;
  partNumber: string;
  description: string;
  descriptionAr: string;
  unitPrice: number;
  inStock: boolean;
  category: string;
}

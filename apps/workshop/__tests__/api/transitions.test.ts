import { isValidTransition, CaseStatus } from '@nrn/shared';

describe('Workshop API — state machine transitions', () => {
  describe('accept: ASSIGNMENT_PENDING → APPOINTMENT_SCHEDULED', () => {
    it('valid transition', () => {
      expect(isValidTransition(CaseStatus.ASSIGNMENT_PENDING, CaseStatus.APPOINTMENT_SCHEDULED)).toBe(true);
    });
    it('already-scheduled case cannot be re-accepted', () => {
      expect(isValidTransition(CaseStatus.APPOINTMENT_SCHEDULED, CaseStatus.APPOINTMENT_SCHEDULED)).toBe(false);
    });
  });

  describe('reject: ASSIGNMENT_PENDING → REJECTED_REASSIGN', () => {
    it('valid transition', () => {
      expect(isValidTransition(CaseStatus.ASSIGNMENT_PENDING, CaseStatus.REJECTED_REASSIGN)).toBe(true);
    });
    it('cannot reject from a non-pending state', () => {
      expect(isValidTransition(CaseStatus.REPAIR_IN_PROGRESS, CaseStatus.REJECTED_REASSIGN)).toBe(false);
    });
  });

  describe('receive: APPOINTMENT_SCHEDULED → VEHICLE_RECEIVED', () => {
    it('valid transition', () => {
      expect(isValidTransition(CaseStatus.APPOINTMENT_SCHEDULED, CaseStatus.VEHICLE_RECEIVED)).toBe(true);
    });
    it('cannot skip vehicle received step', () => {
      expect(isValidTransition(CaseStatus.APPOINTMENT_SCHEDULED, CaseStatus.UNDER_INSPECTION)).toBe(false);
    });
  });

  describe('inspection: VEHICLE_RECEIVED → UNDER_INSPECTION', () => {
    it('valid transition', () => {
      expect(isValidTransition(CaseStatus.VEHICLE_RECEIVED, CaseStatus.UNDER_INSPECTION)).toBe(true);
    });
  });

  describe('estimate: UNDER_INSPECTION → ESTIMATE_PENDING', () => {
    it('valid transition', () => {
      expect(isValidTransition(CaseStatus.UNDER_INSPECTION, CaseStatus.ESTIMATE_PENDING)).toBe(true);
    });
  });

  describe('start repair: ESTIMATE_APPROVED → REPAIR_IN_PROGRESS', () => {
    it('valid transition', () => {
      expect(isValidTransition(CaseStatus.ESTIMATE_APPROVED, CaseStatus.REPAIR_IN_PROGRESS)).toBe(true);
    });
    it('cannot start before estimate is approved', () => {
      expect(isValidTransition(CaseStatus.ESTIMATE_PENDING, CaseStatus.REPAIR_IN_PROGRESS)).toBe(false);
    });
  });

  describe('complete: REPAIR_IN_PROGRESS → REPAIR_COMPLETED', () => {
    it('valid transition', () => {
      expect(isValidTransition(CaseStatus.REPAIR_IN_PROGRESS, CaseStatus.REPAIR_COMPLETED)).toBe(true);
    });
  });

  describe('ready: REPAIR_COMPLETED → READY_FOR_PICKUP', () => {
    it('valid transition', () => {
      expect(isValidTransition(CaseStatus.REPAIR_COMPLETED, CaseStatus.READY_FOR_PICKUP)).toBe(true);
    });
  });

  describe('deliver (handover): READY_FOR_PICKUP → DELIVERED', () => {
    it('valid transition', () => {
      expect(isValidTransition(CaseStatus.READY_FOR_PICKUP, CaseStatus.DELIVERED)).toBe(true);
    });
    it('cannot deliver from repair-in-progress', () => {
      expect(isValidTransition(CaseStatus.REPAIR_IN_PROGRESS, CaseStatus.DELIVERED)).toBe(false);
    });
  });

  describe('invoice: DELIVERED → INVOICE_PENDING', () => {
    it('valid transition', () => {
      expect(isValidTransition(CaseStatus.DELIVERED, CaseStatus.INVOICE_PENDING)).toBe(true);
    });
  });
});

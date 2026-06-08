import { isValidTransition, CaseStatus } from '@nrn/shared';

describe('Ops API — approval transitions', () => {
  describe('approve-estimate: ESTIMATE_PENDING → ESTIMATE_APPROVED', () => {
    it('valid transition', () => {
      expect(isValidTransition(CaseStatus.ESTIMATE_PENDING, CaseStatus.ESTIMATE_APPROVED)).toBe(true);
    });
    it('cannot double-approve', () => {
      expect(isValidTransition(CaseStatus.ESTIMATE_APPROVED, CaseStatus.ESTIMATE_APPROVED)).toBe(false);
    });
  });

  describe('reject-estimate: ESTIMATE_PENDING → UNDER_INSPECTION', () => {
    it('valid transition — sends case back to inspection', () => {
      expect(isValidTransition(CaseStatus.ESTIMATE_PENDING, CaseStatus.UNDER_INSPECTION)).toBe(true);
    });
    it('cannot reject estimate from a non-estimate state', () => {
      expect(isValidTransition(CaseStatus.REPAIR_IN_PROGRESS, CaseStatus.UNDER_INSPECTION)).toBe(false);
    });
  });

  describe('approve-invoice: INVOICE_PENDING → CLOSED', () => {
    it('valid transition — closing the case', () => {
      expect(isValidTransition(CaseStatus.INVOICE_PENDING, CaseStatus.CLOSED)).toBe(true);
    });
    it('cannot close a case that is still in repair', () => {
      expect(isValidTransition(CaseStatus.REPAIR_IN_PROGRESS, CaseStatus.CLOSED)).toBe(false);
    });
    it('cannot close a case that is already closed', () => {
      expect(isValidTransition(CaseStatus.CLOSED, CaseStatus.CLOSED)).toBe(false);
    });
  });
});

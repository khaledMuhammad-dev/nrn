import { isValidTransition, CaseStatus } from '@nrn/shared';

describe('Customer API — book route transitions', () => {
  it('WORKSHOP_SELECTION → ASSIGNMENT_PENDING is valid', () => {
    expect(isValidTransition(CaseStatus.WORKSHOP_SELECTION, CaseStatus.ASSIGNMENT_PENDING)).toBe(true);
  });
  it('CLOSED → ASSIGNMENT_PENDING is invalid', () => {
    expect(isValidTransition(CaseStatus.CLOSED, CaseStatus.ASSIGNMENT_PENDING)).toBe(false);
  });
  it('CANCELLED → ASSIGNMENT_PENDING is invalid', () => {
    expect(isValidTransition(CaseStatus.CANCELLED, CaseStatus.ASSIGNMENT_PENDING)).toBe(false);
  });
});

describe('Customer API — cancel route transitions', () => {
  it('APPOINTMENT_SCHEDULED → CANCELLED is valid', () => {
    expect(isValidTransition(CaseStatus.APPOINTMENT_SCHEDULED, CaseStatus.CANCELLED)).toBe(true);
  });
  it('CLOSED case cannot be cancelled', () => {
    expect(isValidTransition(CaseStatus.CLOSED, CaseStatus.CANCELLED)).toBe(false);
  });
  it('REPAIR_IN_PROGRESS case cannot be cancelled via customer route', () => {
    expect(isValidTransition(CaseStatus.REPAIR_IN_PROGRESS, CaseStatus.CANCELLED)).toBe(false);
  });
});

describe('Customer API — rate route (post-CLOSED)', () => {
  it('CLOSED is a terminal status with no further transitions', () => {
    const statuses = Object.values(CaseStatus);
    const hasForwardTransition = statuses.some(s => isValidTransition(CaseStatus.CLOSED, s));
    expect(hasForwardTransition).toBe(false);
  });
});

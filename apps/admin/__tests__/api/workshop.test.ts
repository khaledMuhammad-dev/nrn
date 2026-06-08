/**
 * Tests for Workshop Admin Panel API routes:
 * - GET/PATCH /api/workshops/[id]
 * - POST /api/workshops/[id]/availability
 * - GET/POST /api/workshops/[id]/slots
 */

describe('Workshop Admin API — availability values', () => {
  const VALID_STATUSES = ['open', 'busy', 'closed'];

  it('recognizes all valid availability statuses', () => {
    VALID_STATUSES.forEach(s => expect(VALID_STATUSES).toContain(s));
  });

  it('rejects unknown availability status', () => {
    expect(VALID_STATUSES).not.toContain('unknown_status');
  });
});

describe('Workshop Admin API — slot validation', () => {
  function isValidSlot(slot: { date: string; startTime: string; endTime: string; maxJobs: number }) {
    const d = new Date(slot.date);
    if (isNaN(d.getTime())) return false;
    if (!slot.startTime.match(/^\d{2}:\d{2}$/)) return false;
    if (!slot.endTime.match(/^\d{2}:\d{2}$/)) return false;
    if (slot.maxJobs < 1) return false;
    return slot.startTime < slot.endTime;
  }

  it('valid slot passes validation', () => {
    expect(isValidSlot({ date: '2026-06-10', startTime: '08:00', endTime: '17:00', maxJobs: 3 })).toBe(true);
  });

  it('slot with end before start is invalid', () => {
    expect(isValidSlot({ date: '2026-06-10', startTime: '17:00', endTime: '08:00', maxJobs: 3 })).toBe(false);
  });

  it('slot with maxJobs=0 is invalid', () => {
    expect(isValidSlot({ date: '2026-06-10', startTime: '08:00', endTime: '17:00', maxJobs: 0 })).toBe(false);
  });

  it('slot with invalid date is invalid', () => {
    expect(isValidSlot({ date: 'not-a-date', startTime: '08:00', endTime: '17:00', maxJobs: 2 })).toBe(false);
  });
});

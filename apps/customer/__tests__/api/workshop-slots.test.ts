function countAvailableSlots(slots: { capacity: number; bookedCount: number }[]): number {
  return slots.reduce((sum, s) => sum + Math.max(0, s.capacity - s.bookedCount), 0);
}

describe('Workshop detail — slot availability calculation', () => {
  it('sums remaining capacity across all slots', () => {
    const slots = [
      { capacity: 2, bookedCount: 0 },
      { capacity: 2, bookedCount: 1 },
      { capacity: 2, bookedCount: 2 },
    ];
    expect(countAvailableSlots(slots)).toBe(3);
  });

  it('clamps negative remaining to 0 (overbooked guard)', () => {
    const slots = [
      { capacity: 2, bookedCount: 5 },
      { capacity: 3, bookedCount: 1 },
    ];
    expect(countAvailableSlots(slots)).toBe(2);
  });

  it('returns 0 when all slots are fully booked', () => {
    const slots = [
      { capacity: 2, bookedCount: 2 },
      { capacity: 3, bookedCount: 3 },
    ];
    expect(countAvailableSlots(slots)).toBe(0);
  });

  it('returns 0 when slots array is empty', () => {
    expect(countAvailableSlots([])).toBe(0);
  });
});

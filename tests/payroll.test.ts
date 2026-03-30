import { describe, it, expect } from 'vitest';
import { calculateShiftHours } from '@/lib/payroll/hours';
import { splitTipsByDailyHours, applyTipAdjustments } from '@/lib/payroll/tips';

describe('hours', () => {
  it('calculates standard shift', () => {
    expect(calculateShiftHours('11:00', '15:00', 30)).toBe(3.5);
  });

  it('handles split shift late closing over midnight', () => {
    expect(calculateShiftHours('22:00', '01:00', 0)).toBe(3);
  });
});

describe('tip split', () => {
  it('splits by hours', () => {
    const res = splitTipsByDailyHours(100, [
      { employeeId: 'a', hours: 2 },
      { employeeId: 'b', hours: 3 },
    ]);
    expect(res.find((r) => r.employeeId === 'a')?.allocatedTips).toBe(40);
    expect(res.find((r) => r.employeeId === 'b')?.allocatedTips).toBe(60);
  });

  it('supports exclusions', () => {
    const res = splitTipsByDailyHours(100, [
      { employeeId: 'a', hours: 2, excluded: true },
      { employeeId: 'b', hours: 3 },
    ]);
    expect(res).toHaveLength(1);
    expect(res[0].allocatedTips).toBe(100);
  });

  it('applies manual adjustments', () => {
    expect(applyTipAdjustments(100, [10, -5])).toBe(105);
  });
});

import { calculateShiftHours } from './hours';
import { splitTipsByDailyHours, applyTipAdjustments } from './tips';

interface ShiftRow { employee_id: string; shift_date: string; start_time: string; end_time: string; unpaid_break_minutes: number; }
interface TipRow { tip_date: string; cash_tips: number; card_tips: number; }
interface AdjustmentRow { employee_id: string; amount: number; kind: 'tips' | 'hours'; }

export function buildWeeklyPayroll(weekStart: string, shifts: ShiftRow[], tips: TipRow[], adjustments: AdjustmentRow[]) {
  const employeeHours = new Map<string, number>();
  const employeeTips = new Map<string, number>();

  const shiftsByDay = new Map<string, { employeeId: string; hours: number }[]>();
  for (const s of shifts) {
    const hours = calculateShiftHours(s.start_time, s.end_time, s.unpaid_break_minutes);
    employeeHours.set(s.employee_id, Number(((employeeHours.get(s.employee_id) ?? 0) + hours).toFixed(2)));
    const daily = shiftsByDay.get(s.shift_date) ?? [];
    daily.push({ employeeId: s.employee_id, hours });
    shiftsByDay.set(s.shift_date, daily);
  }

  for (const t of tips) {
    const totalTips = t.cash_tips + t.card_tips;
    const split = splitTipsByDailyHours(totalTips, (shiftsByDay.get(t.tip_date) ?? []).map((x) => ({ employeeId: x.employeeId, hours: x.hours })));
    for (const row of split) {
      employeeTips.set(row.employeeId, Number(((employeeTips.get(row.employeeId) ?? 0) + row.allocatedTips).toFixed(2)));
    }
  }

  const tipAdjustments = new Map<string, number[]>();
  const hourAdjustments = new Map<string, number[]>();
  for (const a of adjustments) {
    const target = a.kind === 'tips' ? tipAdjustments : hourAdjustments;
    target.set(a.employee_id, [...(target.get(a.employee_id) ?? []), a.amount]);
  }

  const employeeIds = Array.from(new Set([...employeeHours.keys(), ...employeeTips.keys()]));

  return {
    weekStart,
    rows: employeeIds.map((employeeId) => ({
      employeeId,
      totalHours: applyTipAdjustments(employeeHours.get(employeeId) ?? 0, hourAdjustments.get(employeeId) ?? []),
      totalTips: applyTipAdjustments(employeeTips.get(employeeId) ?? 0, tipAdjustments.get(employeeId) ?? []),
    })),
    generatedAt: new Date().toISOString(),
  };
}

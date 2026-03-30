import { NextResponse } from 'next/server';
import { query } from '@/lib/db/client';
import { buildWeeklyPayroll } from '@/lib/payroll/payroll';

interface ShiftRow { employee_id: string; shift_date: string; start_time: string; end_time: string; unpaid_break_minutes: number }
interface TipRow { tip_date: string; cash_tips: number; card_tips: number }
interface AdjustmentRow { employee_id: string; amount: number; kind: 'tips' | 'hours' }
interface EmployeeRow { id: string; full_name: string; payroll_identifier: string }

function toCsv(rows: Array<Record<string, string | number>>) {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => JSON.stringify(row[h] ?? '')).join(','));
  }
  return lines.join('\n');
}

export async function GET(_: Request, ctx: { params: Promise<{ weekId: string }> }) {
  const { weekId } = await ctx.params;
  const shifts = await query<ShiftRow>('select employee_id, shift_date, start_time, end_time, unpaid_break_minutes from shifts where shift_date between $1::date and ($1::date + interval \'6 day\') and archived_at is null', [weekId]);
  const tips = await query<TipRow>('select tip_date, cash_tips, card_tips from tip_entries where tip_date between $1::date and ($1::date + interval \'6 day\') and archived_at is null', [weekId]);
  const adjustments = await query<AdjustmentRow>("select employee_id, amount, kind from payroll_adjustments where week_start = $1 and archived_at is null", [weekId]);
  const employees = await query<EmployeeRow>('select id, full_name, payroll_identifier from employees where archived_at is null');

  const payroll = buildWeeklyPayroll(weekId, shifts, tips, adjustments);
  const rows = payroll.rows.map((r) => {
    const employee = employees.find((e) => e.id === r.employeeId);
    return {
      employee: employee?.full_name ?? r.employeeId,
      payroll_id: employee?.payroll_identifier ?? '',
      total_hours: r.totalHours,
      tips: r.totalTips,
      status: 'draft',
    };
  });

  const csv = toCsv(rows);
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="payroll-${weekId}.csv"`,
    },
  });
}

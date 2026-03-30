import { NextResponse } from 'next/server';
import { query } from '@/lib/db/client';

interface ParseResult { rows: Record<string, string>[]; errors: string[] }

function parseCsv(input: string): ParseResult {
  const lines = input.trim().split(/\r?\n/);
  if (lines.length < 2) return { rows: [], errors: ['CSV must include a header and at least one data row'] };
  const headers = lines[0].split(',').map((x) => x.trim());
  const rows: Record<string, string>[] = [];
  const errors: string[] = [];
  lines.slice(1).forEach((line, idx) => {
    const values = line.split(',').map((x) => x.trim());
    if (values.length !== headers.length) {
      errors.push(`Row ${idx + 2}: column count mismatch`);
      return;
    }
    rows.push(Object.fromEntries(headers.map((h, i) => [h, values[i]])));
  });
  return { rows, errors };
}

export async function POST(req: Request, ctx: { params: Promise<{ entity: string }> }) {
  const { entity } = await ctx.params;
  const body = await req.text();
  const parsed = parseCsv(body);
  const rowErrors: string[] = [...parsed.errors];

  if (entity === 'tips') {
    for (const [idx, row] of parsed.rows.entries()) {
      const cash = Number(row.cash_tips);
      const card = Number(row.card_tips);
      if (!row.tip_date || Number.isNaN(cash) || Number.isNaN(card) || cash < 0 || card < 0) {
        rowErrors.push(`Row ${idx + 2}: invalid tip row`);
        continue;
      }
      await query('insert into tip_entries (tip_date, cash_tips, card_tips, notes) values ($1,$2,$3,$4)', [row.tip_date, cash, card, row.notes ?? null]);
    }
  } else if (entity === 'shifts') {
    for (const [idx, row] of parsed.rows.entries()) {
      const breakMins = Number(row.unpaid_break_minutes ?? 0);
      if (!row.employee_id || !row.shift_date || !row.start_time || !row.end_time || Number.isNaN(breakMins)) {
        rowErrors.push(`Row ${idx + 2}: invalid shift row`);
        continue;
      }
      await query(
        'insert into shifts (employee_id, shift_date, start_time, end_time, unpaid_break_minutes, notes, status) values ($1,$2,$3,$4,$5,$6,$7)',
        [row.employee_id, row.shift_date, row.start_time, row.end_time, breakMins, row.notes ?? null, 'draft'],
      );
    }
  } else if (entity === 'employees') {
    for (const [idx, row] of parsed.rows.entries()) {
      if (!row.full_name || !row.role_id || !row.payroll_identifier || !row.category) {
        rowErrors.push(`Row ${idx + 2}: invalid employee row`);
        continue;
      }
      await query(
        'insert into employees (full_name, role_id, payroll_identifier, active, tip_eligible, category) values ($1,$2,$3,$4,$5,$6)',
        [row.full_name, row.role_id, row.payroll_identifier, row.active !== 'false', row.tip_eligible !== 'false', row.category],
      );
    }
  } else {
    return NextResponse.json({ error: 'Unsupported entity' }, { status: 400 });
  }

  if (rowErrors.length > 0) {
    return NextResponse.json({ imported: parsed.rows.length - rowErrors.length, errors: rowErrors, error_report_csv: ['row,error', ...rowErrors.map((e, i) => `${i + 2},"${e}"`)].join('\n') }, { status: 400 });
  }

  return NextResponse.json({ imported: parsed.rows.length });
}

import { NextResponse } from 'next/server';
import { shiftSchema } from '@/lib/validation/schemas';
import { query } from '@/lib/db/client';
import { logAudit } from '@/lib/audit';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const weekStart = searchParams.get('weekStart');
  if (!weekStart) return NextResponse.json({ error: 'weekStart required' }, { status: 400 });
  const rows = await query(
    `select s.*, e.full_name from shifts s
     join employees e on e.id = s.employee_id
     where s.shift_date between $1::date and ($1::date + interval '6 day')
     and s.archived_at is null order by s.shift_date, e.full_name`,
    [weekStart],
  );
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = shiftSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });

  if (parsed.data.status === 'approved' && !parsed.data.override_reason) {
    return NextResponse.json({ error: 'override_reason required for manager override approval flow' }, { status: 400 });
  }

  const rows = await query(
    `insert into shifts (employee_id, shift_date, start_time, end_time, unpaid_break_minutes, notes, status, override_reason)
     values ($1,$2,$3,$4,$5,$6,$7,$8) returning *`,
    [parsed.data.employee_id, parsed.data.shift_date, parsed.data.start_time, parsed.data.end_time, parsed.data.unpaid_break_minutes, parsed.data.notes ?? null, parsed.data.status, parsed.data.override_reason ?? null],
  );
  await logAudit('system', 'shifts', rows[0].id, 'create', parsed.data.override_reason);
  return NextResponse.json(rows[0], { status: 201 });
}

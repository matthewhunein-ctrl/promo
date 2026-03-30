import { NextResponse } from 'next/server';
import { employeeSchema } from '@/lib/validation/schemas';
import { query } from '@/lib/db/client';
import { logAudit } from '@/lib/audit';

export async function GET() {
  const rows = await query('select * from employees where archived_at is null order by full_name');
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = employeeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });

  const rows = await query(
    `insert into employees (full_name, role_id, payroll_identifier, active, tip_eligible, category)
     values ($1,$2,$3,$4,$5,$6) returning *`,
    [parsed.data.full_name, parsed.data.role_id, parsed.data.payroll_identifier, parsed.data.active, parsed.data.tip_eligible, parsed.data.category],
  );

  await logAudit('system', 'employees', rows[0].id, 'create');
  return NextResponse.json(rows[0], { status: 201 });
}

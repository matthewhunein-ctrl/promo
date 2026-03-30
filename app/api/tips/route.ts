import { NextResponse } from 'next/server';
import { tipEntrySchema } from '@/lib/validation/schemas';
import { query } from '@/lib/db/client';
import { logAudit } from '@/lib/audit';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const weekStart = searchParams.get('weekStart');
  if (!weekStart) return NextResponse.json({ error: 'weekStart required' }, { status: 400 });
  const rows = await query(
    `select * from tip_entries
     where tip_date between $1::date and ($1::date + interval '6 day')
     and archived_at is null order by tip_date`,
    [weekStart],
  );
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = tipEntrySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });

  const rows = await query(
    `insert into tip_entries (tip_date, cash_tips, card_tips, notes)
     values ($1,$2,$3,$4) returning *`,
    [parsed.data.tip_date, parsed.data.cash_tips, parsed.data.card_tips, parsed.data.notes ?? null],
  );
  await logAudit('system', 'tip_entries', rows[0].id, 'create');
  return NextResponse.json(rows[0], { status: 201 });
}

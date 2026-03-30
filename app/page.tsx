export const dynamic = 'force-dynamic';

import { query } from '@/lib/db/client';

export default async function DashboardPage() {
  const [hours] = await query<{ total: number }>("select coalesce(sum(extract(epoch from (end_time - start_time))/3600 - unpaid_break_minutes/60.0),0) as total from shifts where shift_date between date_trunc('week', current_date)::date and (date_trunc('week', current_date)::date + interval '6 day') and archived_at is null");
  const [tips] = await query<{ total: number }>("select coalesce(sum(cash_tips + card_tips),0) as total from tip_entries where tip_date between date_trunc('week', current_date)::date and (date_trunc('week', current_date)::date + interval '6 day') and archived_at is null");
  const [employees] = await query<{ total: number }>('select count(*)::int as total from employees where active = true and archived_at is null');

  const totalHours = Number(hours?.total ?? 0);
  const totalTips = Number(tips?.total ?? 0);

  return (
    <section className="grid grid-2">
      <article className="card"><h2>Weekly Labor Hours</h2><p>{totalHours.toFixed(2)}</p></article>
      <article className="card"><h2>Total Tips</h2><p>${totalTips.toFixed(2)}</p></article>
      <article className="card"><h2>Avg Tip / Labor Hour</h2><p>${(totalHours ? totalTips / totalHours : 0).toFixed(2)}</p></article>
      <article className="card"><h2>Employees Scheduled</h2><p>{employees?.total ?? 0}</p></article>
    </section>
  );
}

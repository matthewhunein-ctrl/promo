'use client';

import { useEffect, useMemo, useState } from 'react';
import { WeekPicker } from '@/components/WeekPicker';

export default function TipsPage() {
  const [weekStart, setWeekStart] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/tips?weekStart=${weekStart}`).then((r) => r.json()).then(setRows).catch(() => setRows([]));
  }, [weekStart]);

  const totals = useMemo(() => rows.reduce((acc, r) => ({ cash: acc.cash + Number(r.cash_tips), card: acc.card + Number(r.card_tips) }), { cash: 0, card: 0 }), [rows]);

  return (
    <section className="card">
      <h2>Tip Entries</h2>
      <WeekPicker weekStart={weekStart} setWeekStart={setWeekStart} />
      <p>Cash: ${totals.cash.toFixed(2)} | Card: ${totals.card.toFixed(2)} | Total: ${(totals.cash + totals.card).toFixed(2)}</p>
      <table className="table">
        <thead><tr><th>Date</th><th>Cash</th><th>Card</th><th>Total</th><th>Notes</th></tr></thead>
        <tbody>{rows.map((r) => <tr key={r.id}><td>{r.tip_date.slice(0,10)}</td><td>{r.cash_tips}</td><td>{r.card_tips}</td><td>{(Number(r.cash_tips)+Number(r.card_tips)).toFixed(2)}</td><td>{r.notes ?? '-'}</td></tr>)}</tbody>
      </table>
    </section>
  );
}

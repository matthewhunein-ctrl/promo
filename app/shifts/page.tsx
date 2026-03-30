'use client';

import { useEffect, useMemo, useState } from 'react';
import { WeekPicker } from '@/components/WeekPicker';
import { calculateShiftHours } from '@/lib/payroll/hours';

export default function ShiftsPage() {
  const [weekStart, setWeekStart] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/shifts?weekStart=${weekStart}`).then((r) => r.json()).then(setRows).catch(() => setRows([]));
  }, [weekStart]);

  const weeklyTotal = useMemo(() => rows.reduce((sum, r) => sum + calculateShiftHours(r.start_time, r.end_time, r.unpaid_break_minutes), 0), [rows]);

  return (
    <section className="card">
      <h2>Shifts (Read-only on mobile)</h2>
      <WeekPicker weekStart={weekStart} setWeekStart={setWeekStart} />
      <p>Weekly total hours: {weeklyTotal.toFixed(2)}</p>
      <table className="table">
        <thead><tr><th>Employee</th><th>Date</th><th>Start</th><th>End</th><th>Break</th><th>Hours</th><th>Status</th><th>Override</th></tr></thead>
        <tbody>{rows.map((r) => <tr key={r.id}><td>{r.full_name}</td><td>{r.shift_date.slice(0,10)}</td><td>{r.start_time.slice(0,5)}</td><td>{r.end_time.slice(0,5)}</td><td>{r.unpaid_break_minutes}</td><td>{calculateShiftHours(r.start_time, r.end_time, r.unpaid_break_minutes)}</td><td>{r.status}</td><td>{r.override_reason ?? '-'}</td></tr>)}</tbody>
      </table>
    </section>
  );
}

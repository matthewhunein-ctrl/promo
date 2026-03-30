'use client';

import { useState } from 'react';
import { WeekPicker } from '@/components/WeekPicker';

export default function PayrollPage() {
  const [weekStart, setWeekStart] = useState(new Date().toISOString().slice(0, 10));

  return (
    <section className="card">
      <h2>Weekly Payroll Export</h2>
      <WeekPicker weekStart={weekStart} setWeekStart={setWeekStart} />
      <p>This MVP exports payroll-ready CSV. API sync is intentionally a placeholder.</p>
      <a href={`/api/payroll/${weekStart}/export`}><button>Download Payroll CSV</button></a>
    </section>
  );
}

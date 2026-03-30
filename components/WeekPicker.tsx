'use client';

export function WeekPicker({ weekStart, setWeekStart }: { weekStart: string; setWeekStart: (v: string) => void }) {
  return (
    <label>
      Week Start:&nbsp;
      <input type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} />
    </label>
  );
}

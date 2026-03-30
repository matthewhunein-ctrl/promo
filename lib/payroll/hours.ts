export function calculateShiftHours(startTime: string, endTime: string, unpaidBreakMinutes: number) {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const start = sh * 60 + sm;
  let end = eh * 60 + em;
  if (end < start) end += 24 * 60;
  const workedMinutes = Math.max(0, end - start - unpaidBreakMinutes);
  return Number((workedMinutes / 60).toFixed(2));
}

export function calculateWeeklyHours(hours: number[]) {
  return Number(hours.reduce((a, b) => a + b, 0).toFixed(2));
}

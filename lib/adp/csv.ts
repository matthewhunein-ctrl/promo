export interface AdpCsvRow {
  payroll_id: string;
  hours: number;
  tips: number;
}

export function formatAdpCsv(rows: AdpCsvRow[]) {
  const header = 'payroll_id,hours,tips';
  return [header, ...rows.map((r) => `${r.payroll_id},${r.hours.toFixed(2)},${r.tips.toFixed(2)}`)].join('\n');
}

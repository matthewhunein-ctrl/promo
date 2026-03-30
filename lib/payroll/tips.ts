export interface DayShiftHours {
  employeeId: string;
  hours: number;
  excluded?: boolean;
}

export interface TipSplitResult {
  employeeId: string;
  allocatedTips: number;
  hours: number;
  shareRatio: number;
}

export function splitTipsByDailyHours(totalTips: number, shifts: DayShiftHours[]): TipSplitResult[] {
  const included = shifts.filter((s) => !s.excluded && s.hours > 0);
  const totalHours = included.reduce((sum, s) => sum + s.hours, 0);
  if (totalHours === 0) {
    return included.map((s) => ({ employeeId: s.employeeId, allocatedTips: 0, hours: s.hours, shareRatio: 0 }));
  }
  return included.map((s) => {
    const shareRatio = s.hours / totalHours;
    return {
      employeeId: s.employeeId,
      hours: s.hours,
      shareRatio: Number(shareRatio.toFixed(6)),
      allocatedTips: Number((totalTips * shareRatio).toFixed(2)),
    };
  });
}

export function applyTipAdjustments(base: number, adjustments: number[]) {
  return Number((base + adjustments.reduce((a, b) => a + b, 0)).toFixed(2));
}

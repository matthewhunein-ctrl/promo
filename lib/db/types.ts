export type EmployeeCategory = 'front_of_house' | 'kitchen' | 'manager_admin';

export interface Employee {
  id: string;
  full_name: string;
  role_id: string;
  payroll_identifier: string;
  active: boolean;
  tip_eligible: boolean;
  category: EmployeeCategory;
  archived_at: string | null;
}

export interface Shift {
  id: string;
  employee_id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  unpaid_break_minutes: number;
  notes: string | null;
  status: 'draft' | 'approved';
  override_reason: string | null;
}

export interface TipEntry {
  id: string;
  tip_date: string;
  cash_tips: number;
  card_tips: number;
  notes: string | null;
}

export interface PayrollAdjustment {
  id: string;
  week_start: string;
  employee_id: string;
  amount: number;
  kind: 'tips' | 'hours';
  reason: string;
}

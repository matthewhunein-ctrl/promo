import { z } from 'zod';

export const employeeSchema = z.object({
  full_name: z.string().min(2),
  role_id: z.string().uuid(),
  payroll_identifier: z.string().min(1),
  active: z.boolean().default(true),
  tip_eligible: z.boolean().default(true),
  category: z.enum(['front_of_house', 'kitchen', 'manager_admin']),
});

export const shiftSchema = z.object({
  employee_id: z.string().uuid(),
  shift_date: z.string().date(),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
  unpaid_break_minutes: z.number().min(0).max(240),
  notes: z.string().max(1000).optional(),
  status: z.enum(['draft', 'approved']).default('draft'),
  override_reason: z.string().max(500).optional(),
}).superRefine((val, ctx) => {
  if (val.status === 'approved' && val.override_reason && val.override_reason.length < 5) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Override reason must be meaningful' });
  }
});

export const tipEntrySchema = z.object({
  tip_date: z.string().date(),
  cash_tips: z.number().min(0),
  card_tips: z.number().min(0),
  notes: z.string().max(1000).optional(),
});

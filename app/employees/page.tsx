export const dynamic = 'force-dynamic';

import { query } from '@/lib/db/client';

interface EmployeeRow {
  id: string;
  full_name: string;
  role_name: string;
  payroll_identifier: string;
  category: string;
  tip_eligible: boolean;
}

export default async function EmployeesPage() {
  const rows = await query<EmployeeRow>('select e.*, r.name as role_name from employees e join roles r on r.id = e.role_id where e.archived_at is null order by e.full_name');

  return (
    <section className="card">
      <h2>Employees</h2>
      <p>Use <code>POST /api/employees</code> with JSON to add/edit employees in MVP.</p>
      <table className="table">
        <thead><tr><th>Name</th><th>Role</th><th>Payroll ID</th><th>Category</th><th>Tip Eligible</th></tr></thead>
        <tbody>{rows.map((r: EmployeeRow) => <tr key={r.id}><td>{r.full_name}</td><td>{r.role_name}</td><td>{r.payroll_identifier}</td><td>{r.category}</td><td>{String(r.tip_eligible)}</td></tr>)}</tbody>
      </table>
    </section>
  );
}

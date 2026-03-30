create extension if not exists "uuid-ossp";

create table roles (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table employees (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  role_id uuid not null references roles(id),
  payroll_identifier text not null,
  active boolean not null default true,
  tip_eligible boolean not null default true,
  category text not null check (category in ('front_of_house','kitchen','manager_admin')),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table payroll_weeks (
  id uuid primary key default uuid_generate_v4(),
  week_start date not null unique,
  status text not null default 'draft' check (status in ('draft','finalized')),
  finalized_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

create table shifts (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid not null references employees(id),
  shift_date date not null,
  start_time time not null,
  end_time time not null,
  unpaid_break_minutes int not null default 0,
  notes text,
  status text not null default 'draft' check (status in ('draft','approved')),
  override_reason text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table tip_entries (
  id uuid primary key default uuid_generate_v4(),
  tip_date date not null,
  cash_tips numeric(10,2) not null default 0,
  card_tips numeric(10,2) not null default 0,
  notes text,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

create table tip_rules (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  method text not null default 'hours_per_day',
  exclude_category text[],
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table payroll_runs (
  id uuid primary key default uuid_generate_v4(),
  week_start date not null,
  status text not null default 'draft' check (status in ('draft','finalized','exported')),
  export_label text not null default 'draft',
  exported_at timestamptz,
  archive_csv text,
  created_at timestamptz not null default now()
);

create table payroll_adjustments (
  id uuid primary key default uuid_generate_v4(),
  week_start date not null,
  employee_id uuid not null references employees(id),
  kind text not null check (kind in ('tips','hours')),
  amount numeric(10,2) not null,
  reason text not null,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default uuid_generate_v4(),
  actor text not null,
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  reason text,
  created_at timestamptz not null default now()
);

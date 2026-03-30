# Crzookie Payroll Prep (MVP)

Internal payroll-prep web app for a small food business. This MVP prioritizes **correctness, transparency, and auditability** over visual polish.

## 1) Delivery Plan

### Phase 1 (Implemented) — smallest usable MVP
**Features**
- Employee listing + API create with validation.
- Shift ingestion and week review (multiple shifts/day supported by data model).
- Tip entry ingestion and week totals.
- Weekly payroll math (hours + tip split + adjustments).
- Payroll CSV export for ADP RUN upload.
- CSV imports for employees, shifts, tips with row-level error report payload.
- Audit logging on create actions.

**Database changes**
- Core entities: employees, roles, shifts, payroll_weeks, tip_entries, tip_rules, payroll_runs, payroll_adjustments, audit_logs.
- Soft-delete archive fields + timestamps.

**UI pages**
- `/` dashboard metrics.
- `/employees`, `/shifts`, `/tips`, `/payroll`.

**API routes**
- `GET/POST /api/employees`
- `GET/POST /api/shifts`
- `GET/POST /api/tips`
- `POST /api/import/[entity]`
- `GET /api/payroll/[weekId]/export`

**Tests**
- Hours calculations
- Split shifts (overnight)
- Tip split by hours
- Exclusions
- Adjustments

### Phase 2 — workflow improvements
**Features**
- Spreadsheet-like editable weekly payroll table.
- Approve/finalize/lock flow.
- Manual adjustment UI with required reason.
- Downloadable CSV error reports as files.
- Export history and printable summary.

**Database changes**
- Add payroll_run_items table (denormalized per employee/week snapshot).
- Add finalized_by and locked_at fields.

**UI pages**
- `/payroll/[weekStart]` detail review page.
- `/imports` with upload/status/error downloads.
- `/reports/weekly/[weekStart]` print view.

**API routes**
- `PATCH /api/payroll/[weekId]/finalize`
- `POST /api/payroll/[weekId]/adjustments`
- `GET /api/payroll/[weekId]/history`

**Tests**
- Finalize lock behavior.
- Adjustment audit requirements.
- Import validation edge cases.

### Phase 3 — ADP integration architecture
**Features**
- Keep CSV as primary reliable path.
- Add real ADP auth/settings screens.
- Background sync jobs and retry logs.

**Database changes**
- adp_connections, adp_sync_jobs, adp_sync_events.

**UI pages**
- `/settings/integrations/adp`
- `/sync-history`

**API routes**
- `POST /api/adp/connect`
- `POST /api/adp/sync/[weekId]`

**Tests**
- Sync state machine and error retries.
- Mapping validation from internal schema to ADP payload.

---

## 2) Phase 1 design before coding

### Database schema
See `sql/migrations/001_init.sql`.

### Folder structure

```
app/
  api/
    employees/
    shifts/
    tips/
    import/[entity]/
    payroll/[weekId]/export/
  employees/
  shifts/
  tips/
  payroll/
lib/
  db/
  payroll/
  validation/
  adp/
sql/
  migrations/
  seed.sql
tests/
```

### Payroll logic in plain English
1. Every shift gets converted to worked hours from start/end minus unpaid break.
2. Weekly hours are sum of all shift hours per employee.
3. For each day, all tips (cash + card) are split by each employee’s share of that day’s eligible worked hours.
4. Weekly tip totals are sum of each day’s split allocations.
5. Manual adjustments are applied as explicit deltas and preserved for audit.
6. Export creates payroll CSV rows for ADP upload.

### Assumptions to confirm
- Week starts on Monday.
- Kitchen/manager employees are generally tip-excluded, but override-able.
- `payroll_identifier` maps directly to ADP employee code.
- No overtime calculation in Phase 1.
- Authentication/authorization handled separately (internal network tooling).

---

## 3) Run locally

1. Copy env:
   ```bash
   cp .env.example .env.local
   ```
2. Install deps:
   ```bash
   npm install
   ```
3. Run migration + seed on Supabase/Postgres:
   ```bash
   psql "$DATABASE_URL" -f sql/migrations/001_init.sql
   psql "$DATABASE_URL" -f sql/seed.sql
   ```
4. Start app:
   ```bash
   npm run dev
   ```
5. Run tests:
   ```bash
   npm test
   ```

## ADP integration notes
- Working production path is CSV export: `GET /api/payroll/:weekId/export`.
- Future API integration points are isolated in `lib/adp/api.ts` and intentionally throw until implemented.


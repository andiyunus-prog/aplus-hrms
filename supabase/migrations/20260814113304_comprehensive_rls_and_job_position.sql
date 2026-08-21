-- ==========================================
-- 1. ADD JOB POSITION TO EMPLOYEES TABLE
-- ==========================================
alter table public.employees 
add column if not exists job_position text null;

create index if not exists idx_employees_job_position on public.employees using btree (job_position);


-- ==========================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS)
-- ==========================================
alter table public.companies enable row level security;
alter table public.roles enable row level security;
alter table public.banks enable row level security;
alter table public.profiles enable row level security;
alter table public.divisions enable row level security;
alter table public.positions enable row level security;
alter table public.employee_job_history enable row level security;
alter table public.employee_compensation enable row level security;
alter table public.employee_bpjs enable row level security;
alter table public.payroll_components enable row level security;
alter table public.payroll_periods enable row level security;
alter table public.payrolls enable row level security;
alter table public.payroll_details enable row level security;
alter table public.attendances enable row level security;
alter table public.employee_loans enable row level security;
alter table public.employee_loan_installments enable row level security;
alter table public.employees enable row level security;
alter table public.leave_types enable row level security;
alter table public.leave_requests enable row level security;
alter table public.salary_components enable row level security;
alter table public.employee_salaries enable row level security;
alter table public.payslips enable row level security;
alter table public.payslip_items enable row level security;


-- ==========================================
-- 3. CREATE AUTHENTICATED ACCESS POLICIES
-- ==========================================

drop policy if exists "Allow authenticated full access on companies" on public.companies;
create policy "Allow authenticated full access on companies" on public.companies for all to authenticated using (true) with check (true);

drop policy if exists "Allow authenticated full access on roles" on public.roles;
create policy "Allow authenticated full access on roles" on public.roles for all to authenticated using (true) with check (true);

drop policy if exists "Allow authenticated full access on banks" on public.banks;
create policy "Allow authenticated full access on banks" on public.banks for all to authenticated using (true) with check (true);

drop policy if exists "Allow authenticated full access on profiles" on public.profiles;
create policy "Allow authenticated full access on profiles" on public.profiles for all to authenticated using (true) with check (true);

drop policy if exists "Allow authenticated full access on divisions" on public.divisions;
create policy "Allow authenticated full access on divisions" on public.divisions for all to authenticated using (true) with check (true);

drop policy if exists "Allow authenticated full access on positions" on public.positions;
create policy "Allow authenticated full access on positions" on public.positions for all to authenticated using (true) with check (true);

drop policy if exists "Allow authenticated full access on employee_job_history" on public.employee_job_history;
create policy "Allow authenticated full access on employee_job_history" on public.employee_job_history for all to authenticated using (true) with check (true);

drop policy if exists "Allow authenticated full access on employee_compensation" on public.employee_compensation;
create policy "Allow authenticated full access on employee_compensation" on public.employee_compensation for all to authenticated using (true) with check (true);

drop policy if exists "Allow authenticated full access on employee_bpjs" on public.employee_bpjs;
create policy "Allow authenticated full access on employee_bpjs" on public.employee_bpjs for all to authenticated using (true) with check (true);

drop policy if exists "Allow authenticated full access on payroll_components" on public.payroll_components;
create policy "Allow authenticated full access on payroll_components" on public.payroll_components for all to authenticated using (true) with check (true);

drop policy if exists "Allow authenticated full access on payroll_periods" on public.payroll_periods;
create policy "Allow authenticated full access on payroll_periods" on public.payroll_periods for all to authenticated using (true) with check (true);

drop policy if exists "Allow authenticated full access on payrolls" on public.payrolls;
create policy "Allow authenticated full access on payrolls" on public.payrolls for all to authenticated using (true) with check (true);

drop policy if exists "Allow authenticated full access on payroll_details" on public.payroll_details;
create policy "Allow authenticated full access on payroll_details" on public.payroll_details for all to authenticated using (true) with check (true);

drop policy if exists "Allow authenticated full access on attendances" on public.attendances;
create policy "Allow authenticated full access on attendances" on public.attendances for all to authenticated using (true) with check (true);

drop policy if exists "Allow authenticated full access on employee_loans" on public.employee_loans;
create policy "Allow authenticated full access on employee_loans" on public.employee_loans for all to authenticated using (true) with check (true);

drop policy if exists "Allow authenticated full access on employee_loan_installments" on public.employee_loan_installments;
create policy "Allow authenticated full access on employee_loan_installments" on public.employee_loan_installments for all to authenticated using (true) with check (true);

drop policy if exists "Allow authenticated full access on employees" on public.employees;
create policy "Allow authenticated full access on employees" on public.employees for all to authenticated using (true) with check (true);

drop policy if exists "Allow authenticated full access on leave_types" on public.leave_types;
create policy "Allow authenticated full access on leave_types" on public.leave_types for all to authenticated using (true) with check (true);

drop policy if exists "Allow authenticated full access on leave_requests" on public.leave_requests;
create policy "Allow authenticated full access on leave_requests" on public.leave_requests for all to authenticated using (true) with check (true);

drop policy if exists "Allow authenticated full access on salary_components" on public.salary_components;
create policy "Allow authenticated full access on salary_components" on public.salary_components for all to authenticated using (true) with check (true);

drop policy if exists "Allow authenticated full access on employee_salaries" on public.employee_salaries;
create policy "Allow authenticated full access on employee_salaries" on public.employee_salaries for all to authenticated using (true) with check (true);

drop policy if exists "Allow authenticated full access on payslips" on public.payslips;
create policy "Allow authenticated full access on payslips" on public.payslips for all to authenticated using (true) with check (true);

drop policy if exists "Allow authenticated full access on payslip_items" on public.payslip_items;
create policy "Allow authenticated full access on payslip_items" on public.payslip_items for all to authenticated using (true) with check (true);
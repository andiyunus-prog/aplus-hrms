-- Helper function to check if the current user is an Admin, Owner, or HR authority
create or replace function public.is_admin_or_owner()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from profiles p
    join roles r on p.role_id = r.id
    where p.id = auth.uid()
      and r.code in ('OWNER', 'ADMIN', 'HRD', 'HR', 'HR_ADMIN')
      and p.status = 'ACTIVE'
      and r.status = 'ACTIVE'
  );
$$;

-- 1. EMPLOYEES TABLE RLS
alter table employees enable row level security;

drop policy if exists "Admins have full access to employees" on employees;
drop policy if exists "Admins full access employees" on employees;
drop policy if exists "Employees view own employee record" on employees;
drop policy if exists "Employees update own employee record" on employees;

create policy "Admins have full access to employees"
on employees for all
using (public.is_admin_or_owner())
with check (public.is_admin_or_owner());

create policy "Employees view own employee record"
on employees for select
using (auth_user_id = auth.uid());

create policy "Employees update own employee record"
on employees for update
using (auth_user_id = auth.uid())
with check (auth_user_id = auth.uid());


-- 2. PAYSLIPS TABLE RLS
alter table payslips enable row level security;

drop policy if exists "Admins full access payslips" on payslips;
drop policy if exists "Employees view own payslips" on payslips;

create policy "Admins full access payslips"
on payslips for all
using (public.is_admin_or_owner())
with check (public.is_admin_or_owner());

create policy "Employees view own payslips"
on payslips for select
using (employee_id in (select id from employees where auth_user_id = auth.uid()));


-- 3. EMPLOYEE LOANS TABLE RLS
alter table employee_loans enable row level security;

drop policy if exists "Admins full access loans" on employee_loans;
drop policy if exists "Employees view own loans" on employee_loans;

create policy "Admins full access loans"
on employee_loans for all
using (public.is_admin_or_owner())
with check (public.is_admin_or_owner());

create policy "Employees view own loans"
on employee_loans for select
using (employee_id in (select id from employees where auth_user_id = auth.uid()));


-- 4. ATTENDANCES TABLE RLS
alter table attendances enable row level security;

drop policy if exists "Admins full access attendances" on attendances;
drop policy if exists "Employees view own attendances" on attendances;

create policy "Admins full access attendances"
on attendances for all
using (public.is_admin_or_owner())
with check (public.is_admin_or_owner());

create policy "Employees view own attendances"
on attendances for select
using (employee_id in (select id from employees where auth_user_id = auth.uid()));
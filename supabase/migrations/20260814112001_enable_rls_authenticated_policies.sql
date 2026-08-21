-- Enable Row Level Security on all core HRMS tables
alter table public.companies enable row level security;
alter table public.employees enable row level security;
alter table public.employee_salaries enable row level security;
alter table public.employee_loans enable row level security;
alter table public.employee_loan_installments enable row level security;
alter table public.payslips enable row level security;
alter table public.payslip_items enable row level security;
alter table public.salary_components enable row level security;

-- Create policies to allow full access for authenticated internal HR/Admin users
create policy "Allow authenticated full access on companies" on public.companies
  for all to authenticated using (true) with check (true);

create policy "Allow authenticated full access on employees" on public.employees
  for all to authenticated using (true) with check (true);

create policy "Allow authenticated full access on employee_salaries" on public.employee_salaries
  for all to authenticated using (true) with check (true);

create policy "Allow authenticated full access on employee_loans" on public.employee_loans
  for all to authenticated using (true) with check (true);

create policy "Allow authenticated full access on employee_loan_installments" on public.employee_loan_installments
  for all to authenticated using (true) with check (true);

create policy "Allow authenticated full access on payslips" on public.payslips
  for all to authenticated using (true) with check (true);

create policy "Allow authenticated full access on payslip_items" on public.payslip_items
  for all to authenticated using (true) with check (true);

create policy "Allow authenticated full access on salary_components" on public.salary_components
  for all to authenticated using (true) with check (true);
create table public.employee_lateness (
  id uuid default gen_random_uuid() primary key,
  employee_id uuid references public.employees(id) on delete cascade not null,
  period_month integer not null,
  period_year integer not null,
  late_minutes integer default 0 not null,
  deduction_amount numeric default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (employee_id, period_month, period_year)
);

-- Enable RLS
alter table public.employee_lateness enable row level security;

-- Create policy for authenticated users
create policy "Allow authenticated access to employee_lateness" 
on public.employee_lateness for all using (auth.role() = 'authenticated');
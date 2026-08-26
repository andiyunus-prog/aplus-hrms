-- 1. Add auth_user_id column to employees table to link with Supabase auth users
alter table public.employees 
add column auth_user_id uuid references auth.users(id) on delete set null;

-- 2. Create an index for faster lookups when employees log in
create index idx_employees_auth_user_id on public.employees(auth_user_id);
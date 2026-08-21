-- 1. SALARY COMPONENTS (Company level allowances and deductions)
CREATE TABLE public.salary_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('EARNING', 'DEDUCTION')),
  is_default BOOLEAN DEFAULT false, -- If true, it automatically applies to all new payslips
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. EMPLOYEE SALARIES (Stores the current fixed base salary)
CREATE TABLE public.employee_salaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE UNIQUE,
  base_salary NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. PAYSLIPS (The monthly generated payslip record)
CREATE TABLE public.payslips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  period_month INTEGER NOT NULL,
  period_year INTEGER NOT NULL,
  base_salary NUMERIC NOT NULL DEFAULT 0,
  total_earnings NUMERIC NOT NULL DEFAULT 0,
  total_deductions NUMERIC NOT NULL DEFAULT 0,
  net_salary NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PAID')),
  payment_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_employee_payslip_period UNIQUE (employee_id, period_month, period_year)
);

-- 4. PAYSLIP LINE ITEMS (Snapshot of allowances/deductions for that specific month)
CREATE TABLE public.payslip_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payslip_id UUID NOT NULL REFERENCES public.payslips(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('EARNING', 'DEDUCTION')),
  amount NUMERIC NOT NULL DEFAULT 0
);

-- 5. INDEXES FOR PERFORMANCE
CREATE INDEX idx_salary_components_company ON public.salary_components USING btree (company_id);
CREATE INDEX idx_payslips_employee ON public.payslips USING btree (employee_id);
CREATE INDEX idx_payslip_items_payslip ON public.payslip_items USING btree (payslip_id);
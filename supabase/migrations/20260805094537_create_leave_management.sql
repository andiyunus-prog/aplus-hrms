-- 1. LEAVE TYPES TABLE
-- Stores the different types of time-off each company allows
CREATE TABLE public.leave_types (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  name TEXT NOT NULL,             -- e.g., 'Annual Leave', 'Sick Leave', 'Maternity'
  code TEXT NOT NULL,             -- e.g., 'AL', 'SL', 'ML'
  description TEXT,
  days_allowed INTEGER NOT NULL DEFAULT 0, -- Default quota per year
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT leave_types_pkey PRIMARY KEY (id),
  CONSTRAINT leave_types_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE,
  CONSTRAINT uq_leave_type_code_company UNIQUE (company_id, code)
);

-- 2. LEAVE REQUESTS TABLE
-- Tracks when employees ask for time off and manager approvals
CREATE TABLE public.leave_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  leave_type_id UUID NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL,    -- Calculated number of days taking off
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING'::text,
  rejection_reason TEXT,          -- If rejected, why?
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT leave_requests_pkey PRIMARY KEY (id),
  CONSTRAINT leave_requests_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE,
  CONSTRAINT leave_requests_leave_type_id_fkey FOREIGN KEY (leave_type_id) REFERENCES public.leave_types(id) ON DELETE RESTRICT,
  CONSTRAINT leave_requests_status_check CHECK (
    status = ANY (ARRAY['PENDING'::text, 'APPROVED'::text, 'REJECTED'::text, 'CANCELLED'::text])
  ),
  CONSTRAINT chk_leave_dates CHECK (end_date >= start_date)
);

-- 3. OPTIMIZATION INDEXES
-- Makes searching by employee or pending status extremely fast
CREATE INDEX idx_leave_requests_employee ON public.leave_requests USING btree (employee_id);
CREATE INDEX idx_leave_requests_status ON public.leave_requests USING btree (status);
CREATE INDEX idx_leave_types_company ON public.leave_types USING btree (company_id);
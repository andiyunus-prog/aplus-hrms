CREATE TABLE public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,

    status TEXT NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'INACTIVE')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_roles_status
ON public.roles(status);

INSERT INTO public.roles (code, name, description)
VALUES
('OWNER', 'Owner', 'Business owner with full access'),
('HR', 'Human Resources', 'Manage employees and payroll'),
('CASHIER', 'Cashier', 'Handle loan disbursement and payroll payment'),
('EMPLOYEE', 'Employee', 'Regular employee');
CREATE TABLE public.payrolls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    payroll_period_id UUID NOT NULL
        REFERENCES public.payroll_periods(id)
        ON DELETE RESTRICT,

    employee_id UUID NOT NULL
        REFERENCES public.employees(id)
        ON DELETE RESTRICT,

    basic_salary NUMERIC(15,2) NOT NULL DEFAULT 0,

    gross_earnings NUMERIC(15,2) NOT NULL DEFAULT 0,
    total_deductions NUMERIC(15,2) NOT NULL DEFAULT 0,
    net_salary NUMERIC(15,2) NOT NULL DEFAULT 0,

    status TEXT NOT NULL DEFAULT 'DRAFT'
        CHECK (
            status IN (
                'DRAFT',
                'CALCULATED',
                'APPROVED',
                'PAID',
                'LOCKED'
            )
        ),

    paid_at TIMESTAMPTZ,

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_payroll_period_employee
        UNIQUE (payroll_period_id, employee_id),

    CONSTRAINT chk_payroll_basic_salary
        CHECK (basic_salary >= 0),

    CONSTRAINT chk_payroll_gross
        CHECK (gross_earnings >= 0),

    CONSTRAINT chk_payroll_deductions
        CHECK (total_deductions >= 0),

    CONSTRAINT chk_payroll_net_salary
        CHECK (net_salary >= 0)
);

CREATE INDEX idx_payrolls_period
    ON public.payrolls(payroll_period_id);

CREATE INDEX idx_payrolls_employee
    ON public.payrolls(employee_id);

CREATE INDEX idx_payrolls_status
    ON public.payrolls(status);
CREATE TABLE public.payroll_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    company_id UUID NOT NULL
        REFERENCES public.companies(id)
        ON DELETE RESTRICT,

    period_year INTEGER NOT NULL,
    period_month INTEGER NOT NULL,

    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    payment_date DATE,

    status TEXT NOT NULL DEFAULT 'OPEN'
        CHECK (
            status IN (
                'OPEN',
                'PROCESSING',
                'APPROVED',
                'PAID',
                'LOCKED'
            )
        ),

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_payroll_period
        UNIQUE (company_id, period_year, period_month),

    CONSTRAINT chk_payroll_month
        CHECK (period_month BETWEEN 1 AND 12),

    CONSTRAINT chk_payroll_year
        CHECK (period_year >= 2000),

    CONSTRAINT chk_payroll_dates
        CHECK (period_end >= period_start)
);

CREATE INDEX idx_payroll_periods_company
    ON public.payroll_periods(company_id);

CREATE INDEX idx_payroll_periods_status
    ON public.payroll_periods(status);

CREATE INDEX idx_payroll_periods_year_month
    ON public.payroll_periods(period_year, period_month);
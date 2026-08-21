CREATE TABLE public.payroll_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,

    component_type TEXT NOT NULL
        CHECK (
            component_type IN (
                'EARNING',
                'DEDUCTION'
            )
        ),

    calculation_type TEXT NOT NULL
        CHECK (
            calculation_type IN (
                'FIXED',
                'VARIABLE',
                'CALCULATED'
            )
        ),

    is_taxable BOOLEAN NOT NULL DEFAULT FALSE,
    is_bpjs_basis BOOLEAN NOT NULL DEFAULT FALSE,

    display_order INTEGER NOT NULL DEFAULT 0,

    status TEXT NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'INACTIVE')),

    description TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payroll_components_type
    ON public.payroll_components(component_type);

CREATE INDEX idx_payroll_components_status
    ON public.payroll_components(status);

CREATE INDEX idx_payroll_components_display_order
    ON public.payroll_components(display_order);
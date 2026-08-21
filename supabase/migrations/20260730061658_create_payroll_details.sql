CREATE TABLE public.payroll_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    payroll_id UUID NOT NULL
        REFERENCES public.payrolls(id)
        ON DELETE RESTRICT,

    payroll_component_id UUID NOT NULL
        REFERENCES public.payroll_components(id)
        ON DELETE RESTRICT,

    quantity NUMERIC(15,4) NOT NULL DEFAULT 1,

    rate NUMERIC(15,2) NOT NULL DEFAULT 0,

    amount NUMERIC(15,2) NOT NULL DEFAULT 0,

    reference_type TEXT,

    reference_id UUID,

    description TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_payroll_detail_quantity
        CHECK (quantity >= 0),

    CONSTRAINT chk_payroll_detail_rate
        CHECK (rate >= 0),

    CONSTRAINT chk_payroll_detail_amount
        CHECK (amount >= 0)
);

CREATE INDEX idx_payroll_details_payroll
    ON public.payroll_details(payroll_id);

CREATE INDEX idx_payroll_details_component
    ON public.payroll_details(payroll_component_id);

CREATE INDEX idx_payroll_details_reference
    ON public.payroll_details(reference_type, reference_id);
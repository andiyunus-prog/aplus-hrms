CREATE TABLE public.positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    company_id UUID NOT NULL
        REFERENCES public.companies(id)
        ON DELETE RESTRICT,

    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,

    status TEXT NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'INACTIVE')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_position_company_code
        UNIQUE (company_id, code),

    CONSTRAINT uq_position_company_name
        UNIQUE (company_id, name)
);

CREATE INDEX idx_positions_company
    ON public.positions(company_id);

CREATE INDEX idx_positions_status
    ON public.positions(status);
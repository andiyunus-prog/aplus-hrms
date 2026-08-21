CREATE TABLE public.employee_bpjs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    employee_id UUID NOT NULL
        REFERENCES public.employees(id)
        ON DELETE RESTRICT,

    bpjs_health_number TEXT,
    bpjs_employment_number TEXT,

    health_active BOOLEAN NOT NULL DEFAULT TRUE,
    employment_active BOOLEAN NOT NULL DEFAULT TRUE,

    health_employee_rate NUMERIC(5,4) NOT NULL DEFAULT 0.0100,
    health_employer_rate NUMERIC(5,4) NOT NULL DEFAULT 0.0400,

    employment_employee_rate NUMERIC(5,4) NOT NULL DEFAULT 0.0000,
    employment_employer_rate NUMERIC(5,4) NOT NULL DEFAULT 0.0000,

    effective_from DATE NOT NULL,
    effective_to DATE,

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_employee_bpjs_employee
        UNIQUE (employee_id),

    CONSTRAINT chk_bpjs_dates
        CHECK (
            effective_to IS NULL
            OR effective_to >= effective_from
        ),

    CONSTRAINT chk_health_employee_rate
        CHECK (
            health_employee_rate >= 0
            AND health_employee_rate <= 1
        ),

    CONSTRAINT chk_health_employer_rate
        CHECK (
            health_employer_rate >= 0
            AND health_employer_rate <= 1
        ),

    CONSTRAINT chk_employment_employee_rate
        CHECK (
            employment_employee_rate >= 0
            AND employment_employee_rate <= 1
        ),

    CONSTRAINT chk_employment_employer_rate
        CHECK (
            employment_employer_rate >= 0
            AND employment_employer_rate <= 1
        )
);

CREATE INDEX idx_employee_bpjs_employee
    ON public.employee_bpjs(employee_id);

CREATE INDEX idx_employee_bpjs_effective_from
    ON public.employee_bpjs(effective_from);
CREATE TABLE public.employee_compensation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    employee_id UUID NOT NULL
        REFERENCES public.employees(id)
        ON DELETE RESTRICT,

    effective_from DATE NOT NULL,
    effective_to DATE,

    basic_salary NUMERIC(15,2) NOT NULL,

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_compensation_dates
        CHECK (
            effective_to IS NULL
            OR effective_to >= effective_from
        ),

    CONSTRAINT chk_compensation_salary
        CHECK (basic_salary >= 0)
);

CREATE INDEX idx_employee_compensation_employee
    ON public.employee_compensation(employee_id);

CREATE INDEX idx_employee_compensation_effective_from
    ON public.employee_compensation(effective_from);
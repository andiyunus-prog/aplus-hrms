CREATE TABLE public.employee_job_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    employee_id UUID NOT NULL
        REFERENCES public.employees(id)
        ON DELETE RESTRICT,

    division_id UUID NOT NULL
        REFERENCES public.divisions(id)
        ON DELETE RESTRICT,

    position_id UUID NOT NULL
        REFERENCES public.positions(id)
        ON DELETE RESTRICT,

    effective_from DATE NOT NULL,
    effective_to DATE,

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_job_history_dates
        CHECK (
            effective_to IS NULL
            OR effective_to >= effective_from
        )
);

CREATE INDEX idx_employee_job_history_employee
    ON public.employee_job_history(employee_id);

CREATE INDEX idx_employee_job_history_division
    ON public.employee_job_history(division_id);

CREATE INDEX idx_employee_job_history_position
    ON public.employee_job_history(position_id);

CREATE INDEX idx_employee_job_history_effective_from
    ON public.employee_job_history(effective_from);
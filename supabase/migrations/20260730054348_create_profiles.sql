CREATE TABLE public.profiles (
    id UUID PRIMARY KEY
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    employee_id UUID UNIQUE
        REFERENCES public.employees(id)
        ON DELETE SET NULL,

    role_id UUID NOT NULL
        REFERENCES public.roles(id)
        ON DELETE RESTRICT,

    full_name TEXT NOT NULL,

    status TEXT NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'INACTIVE')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_employee
    ON public.profiles(employee_id);

CREATE INDEX idx_profiles_role
    ON public.profiles(role_id);

CREATE INDEX idx_profiles_status
    ON public.profiles(status);
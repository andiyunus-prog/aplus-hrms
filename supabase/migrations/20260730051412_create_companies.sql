CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    legal_name TEXT NOT NULL,

    address TEXT,
    phone TEXT,
    email TEXT,
    npwp TEXT,

    logo_url TEXT,

    status TEXT NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'INACTIVE')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_companies_status
ON public.companies(status);
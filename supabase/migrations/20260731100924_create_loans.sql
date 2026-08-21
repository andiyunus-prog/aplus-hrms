CREATE TABLE public.employee_loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    employee_id UUID NOT NULL
        REFERENCES public.employees(id)
        ON DELETE RESTRICT,

    request_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount NUMERIC(15,2) NOT NULL,
    tenor_months INTEGER NOT NULL DEFAULT 1,
    
    -- How much to deduct per month
    monthly_installment NUMERIC(15,2) NOT NULL,
    purpose TEXT,

    status TEXT NOT NULL DEFAULT 'PENDING'
        CHECK (
            status IN (
                'PENDING',
                'APPROVED',
                'REJECTED',
                'DISBURSED',
                'PAID_OFF'
            )
        ),

    -- Approval Audit
    approved_by UUID
        REFERENCES public.profiles(id)
        ON DELETE RESTRICT,
    approved_at TIMESTAMPTZ,
    
    -- Disbursement Logic
    disbursement_method TEXT
        CHECK (
            disbursement_method IN (
                'CASHIER',
                'OWNER',
                'BANK_TRANSFER'
            )
        ),
    disbursed_by UUID
        REFERENCES public.profiles(id)
        ON DELETE RESTRICT,
    disbursed_at TIMESTAMPTZ,

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_loan_amount
        CHECK (amount > 0),

    CONSTRAINT chk_loan_tenor
        CHECK (tenor_months > 0),

    CONSTRAINT chk_loan_installment
        CHECK (monthly_installment > 0)
);

CREATE INDEX idx_employee_loans_employee
    ON public.employee_loans(employee_id);

CREATE INDEX idx_employee_loans_status
    ON public.employee_loans(status);


-- Repayment Schedule Table
CREATE TABLE public.employee_loan_installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    loan_id UUID NOT NULL
        REFERENCES public.employee_loans(id)
        ON DELETE CASCADE,

    -- The month/year this installment should be deducted from payroll
    period_year INTEGER NOT NULL,
    period_month INTEGER NOT NULL,
    
    amount NUMERIC(15,2) NOT NULL,
    
    status TEXT NOT NULL DEFAULT 'UNPAID'
        CHECK (status IN ('UNPAID', 'PAID')),
        
    -- Linked to the payroll record once it is actually deducted
    payroll_id UUID
        REFERENCES public.payrolls(id)
        ON DELETE RESTRICT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_installment_amount
        CHECK (amount > 0),

    CONSTRAINT chk_installment_month
        CHECK (period_month BETWEEN 1 AND 12),

    CONSTRAINT chk_installment_year
        CHECK (period_year >= 2000)
);

CREATE INDEX idx_loan_installments_loan
    ON public.employee_loan_installments(loan_id);

CREATE INDEX idx_loan_installments_period
    ON public.employee_loan_installments(period_year, period_month);
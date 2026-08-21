-- Migration: Add missing columns and status constraints to employee_loans
ALTER TABLE public.employee_loans 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS disbursed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Ensure status supports PENDING, APPROVED, REJECTED, DISBURSED
ALTER TABLE public.employee_loans 
DROP CONSTRAINT IF EXISTS employee_loans_status_check;

ALTER TABLE public.employee_loans 
ADD CONSTRAINT employee_loans_status_check 
CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'DISBURSED', 'COMPLETED'));
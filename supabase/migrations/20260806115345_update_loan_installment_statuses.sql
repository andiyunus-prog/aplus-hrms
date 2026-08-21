ALTER TABLE public.employee_loan_installments 
DROP CONSTRAINT IF EXISTS employee_loan_installments_status_check;

ALTER TABLE public.employee_loan_installments 
ADD CONSTRAINT employee_loan_installment_status_check 
CHECK (status IN ('UNPAID', 'PAID', 'SKIPPED', 'DEFERRED'));
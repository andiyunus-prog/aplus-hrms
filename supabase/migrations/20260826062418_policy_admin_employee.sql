-- ==========================================
-- CORRECTED RLS POLICIES MIGRATION FOR APLUS HRMS
-- ==========================================

-- 1. EMPLOYEES TABLE POLICIES
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins have full access to employees" ON employees;
DROP POLICY IF EXISTS "Employees can view own record" ON employees;
DROP POLICY IF EXISTS "Employees can update own record" ON employees;

-- Admin Policy: Admins have full access if they have a profile with an admin role, 
-- OR if their auth email starts with 'admin'
CREATE POLICY "Admins have full access to employees"
ON employees
FOR ALL
USING (
  auth.jwt() ->> 'email' LIKE 'admin%' OR 
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() AND r.code ILIKE '%admin%'
  )
)
WITH CHECK (
  auth.jwt() ->> 'email' LIKE 'admin%' OR 
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() AND r.code ILIKE '%admin%'
  )
);

-- Employee Policy: Regular employees can view their own record
CREATE POLICY "Employees can view own record"
ON employees
FOR SELECT
USING (auth_user_id = auth.uid());

-- Employee Policy: Regular employees can update their own record
CREATE POLICY "Employees can update own record"
ON employees
FOR UPDATE
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());


-- 2. EMPLOYEE_SALARIES TABLE POLICIES (Matching your schema table)
ALTER TABLE employee_salaries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins full access salaries" ON employee_salaries;
DROP POLICY IF EXISTS "Employees view own salaries" ON employee_salaries;

CREATE POLICY "Admins full access salaries"
ON employee_salaries
FOR ALL
USING (
  auth.jwt() ->> 'email' LIKE 'admin%' OR 
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() AND r.code ILIKE '%admin%'
  )
)
WITH CHECK (
  auth.jwt() ->> 'email' LIKE 'admin%' OR 
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() AND r.code ILIKE '%admin%'
  )
);

CREATE POLICY "Employees view own salaries"
ON employee_salaries
FOR SELECT
USING (
  employee_id IN (
    SELECT id FROM employees WHERE auth_user_id = auth.uid()
  )
);


-- 3. PAYSLIPS TABLE POLICIES (Matching your schema table)
ALTER TABLE payslips ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins full access payslips" ON payslips;
DROP POLICY IF EXISTS "Employees view own payslips" ON payslips;

CREATE POLICY "Admins full access payslips"
ON payslips
FOR ALL
USING (
  auth.jwt() ->> 'email' LIKE 'admin%' OR 
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() AND r.code ILIKE '%admin%'
  )
)
WITH CHECK (
  auth.jwt() ->> 'email' LIKE 'admin%' OR 
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() AND r.code ILIKE '%admin%'
  )
);

CREATE POLICY "Employees view own payslips"
ON payslips
FOR SELECT
USING (
  employee_id IN (
    SELECT id FROM employees WHERE auth_user_id = auth.uid()
  )
);
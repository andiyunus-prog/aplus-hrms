CREATE POLICY "Admins have full access to employees"
ON employees
FOR ALL
USING (
  auth.uid() IN (
    SELECT p.id FROM profiles p 
    JOIN roles r ON p.role_id = r.id 
    WHERE r.code ILIKE '%admin%' OR r.code ILIKE '%owner%' OR r.name ILIKE '%admin%' OR r.name ILIKE '%owner%'
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT p.id FROM profiles p 
    JOIN roles r ON p.role_id = r.id 
    WHERE r.code ILIKE '%admin%' OR r.code ILIKE '%owner%' OR r.name ILIKE '%admin%' OR r.name ILIKE '%owner%'
  )
);
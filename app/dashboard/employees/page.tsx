import { createAdminClient } from '../../../utils/supabase/admin'
import EmployeeTable from './employee-table'
import CreateEmployeeModal from './create-employee-modal'
import { getCurrentUserRole } from '../../../utils/supabase/auth'
import { redirect } from 'next/navigation'

export default async function EmployeesPage() {
  const adminSupabase = createAdminClient()
// SECURITY GUARD: Lock out regular employees
  const userRole = await getCurrentUserRole()
  const isRegularEmployee = !['OWNER', 'ADMIN', 'HRD', 'HR', 'HR_ADMIN'].includes(userRole || '')

  if (isRegularEmployee) {
    redirect('/dashboard/my-profile')
  }
  const [{ data: employees }, { data: companies }] = await Promise.all([
    adminSupabase
      .from('employees')
      .select('*, companies(id, name, legal_name)')
      .order('created_at', { ascending: false }),
    adminSupabase
      .from('companies')
      .select('id, name, legal_name')
      .order('name', { ascending: true }),
  ])

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-sm text-gray-500">Manage company staff, assignments, and access credentials.</p>
        </div>
        <CreateEmployeeModal companies={companies || []} />
      </div>

      <EmployeeTable 
        employees={employees || []} 
        companies={companies || []} 
      />
    </div>
  )
}
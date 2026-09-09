export const dynamic = 'force-dynamic'

import { createAdminClient } from '../../../utils/supabase/admin'
import EmployeeTable from './employee-table'
import CreateEmployeeModal from './create-employee-modal'
import { getCurrentUserRole } from '../../../utils/supabase/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function EmployeesPage() {
  const adminSupabase = createAdminClient()

  // SECURITY GUARD: Lock out regular employees
  const userRole = await getCurrentUserRole()
  const isRegularEmployee = !['OWNER', 'ADMIN', 'HRD', 'HR', 'HR_ADMIN'].includes(userRole || '')

  if (isRegularEmployee) {
    redirect('/dashboard/my-profile')
  }

  // Fetch ACTIVE employees, companies, and preset departments in parallel
  const [{ data: employees }, { data: companies }, { data: departments }] = await Promise.all([
    adminSupabase
      .from('employees')
      .select('*, companies(id, name, legal_name)')
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false }),
    adminSupabase
      .from('companies')
      .select('id, name, legal_name')
      .order('name', { ascending: true }),
    adminSupabase
      .from('departments')
      .select('id, company_id, name')
      .order('name', { ascending: true }),
  ])

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Active Employee Management</h1>
          <p className="text-sm text-gray-500">Manage active company staff, assignments, and access credentials.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/employees/resigned"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-xs px-3.5 py-2.5 rounded-md transition-colors border border-gray-300 flex items-center gap-1.5"
          >
            📁 Resigned Staff Archive
          </Link>
          <CreateEmployeeModal 
            companies={companies || []} 
            departments={departments || []} 
          />
        </div>
      </div>

      <EmployeeTable 
        employees={employees || []} 
        companies={companies || []} 
        departments={departments || []} 
      />
    </div>
  )
}
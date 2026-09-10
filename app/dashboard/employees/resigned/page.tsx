export const dynamic = 'force-dynamic'

import { createAdminClient } from '../../../../utils/supabase/admin'
import { getCurrentUserRole } from '../../../../utils/supabase/auth'
import { redirect } from 'next/navigation'
import { rehireEmployee } from '../actions'
import Link from 'next/link'

export default async function ResignedEmployeesPage() {
  const userRole = await getCurrentUserRole()
  if (userRole !== 'OWNER' && userRole !== 'ADMIN' && userRole !== 'HRD') {
    redirect('/dashboard')
  }

  const adminSupabase = createAdminClient()

  // Fetch only RESIGNED or INACTIVE employees
  const { data: formerEmployees } = await adminSupabase
    .from('employees')
    .select('*, companies(name)')
    .in('status', ['RESIGNED', 'INACTIVE'])
    .order('updated_at', { ascending: false })

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/dashboard/employees" className="text-xs text-blue-600 hover:underline mb-1 inline-block font-medium">
            &larr; Back to Active Employees
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Resigned & Inactive Staff Archive</h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Historical records of former staff. Re-hire returning staff anytime to restore active status.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
              <th className="p-3">Employee Name & Code</th>
              <th className="p-3">Department</th>
              <th className="p-3">Hire Date</th>
              <th className="p-3">Resignation Date</th>
              <th className="p-3">Reason / Note</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {formerEmployees && formerEmployees.length > 0 ? (
              formerEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-900">
                    {emp.full_name}
                    <p className="text-xs text-gray-400 font-mono">Code: {emp.employee_code}</p>
                  </td>
                  <td className="p-3 text-gray-600">{emp.department || '-'}</td>
                  <td className="p-3 text-gray-600">{emp.hire_date || '-'}</td>
                  <td className="p-3 font-medium text-red-600">{emp.resign_date || '-'}</td>
                  <td className="p-3 text-gray-500 text-xs">{emp.notes || 'Resigned'}</td>
                  <td className="p-3 text-right">
                    <form action={rehireEmployee} className="inline-flex items-center gap-2">
                      <input type="hidden" name="employee_id" value={emp.id} />
                      <input 
                        type="date" 
                        name="hire_date" 
                        required 
                        defaultValue={new Date().toISOString().split('T')[0]} 
                        className="rounded border border-gray-300 p-1 text-xs bg-white focus:ring-blue-500"
                      />
                      <button 
                        type="submit" 
                        className="bg-green-600 hover:bg-green-700 text-white font-medium text-xs px-3 py-1.5 rounded transition-colors"
                      >
                        Re-hire
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400 text-xs">
                  No resigned or inactive employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
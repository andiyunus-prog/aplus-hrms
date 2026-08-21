import { createClient } from '../../../utils/supabase/server'
import { createLeaveRequest } from './actions'
import LeaveTable from './leave-table'
import Link from 'next/link'

// 1. Explicitly define the shapes for our dropdown data
type EmployeeOption = {
  id: string
  full_name: string
  employee_code: string
  companies: { name: string | null } | null
}

type LeaveTypeOption = {
  id: string
  name: string
  code: string
  companies: { name: string | null } | null
}

export default async function LeaveManagementPage() {
  const supabase = await createClient()

  // Fetch employees for the form dropdown
  const { data: rawEmployees } = await supabase
    .from('employees')
    .select('id, full_name, employee_code, companies(name)')
    .eq('status', 'ACTIVE')
    .order('full_name')
    
  const employees = rawEmployees as unknown as EmployeeOption[]

  // Fetch leave types for the form dropdown
  const { data: rawLeaveTypes } = await supabase
    .from('leave_types')
    .select('id, name, code, companies(name)')
    .eq('is_active', true)
    .order('name')
    
  const leaveTypes = rawLeaveTypes as unknown as LeaveTypeOption[]

  // Fetch all leave requests for the table
  const { data: rawRequests } = await supabase
    .from('leave_requests')
    .select(`
      *,
      employees (full_name, employee_code, department, companies(name, legal_name)),
      leave_types (name, code)
    `)
    .order('created_at', { ascending: false })

  // Force TypeScript to recognize the joined shape
  const requests = rawRequests as any[] || []

  const hasLeaveTypes = leaveTypes && leaveTypes.length > 0

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-500 mt-1">Review, approve, and track employee time off.</p>
        </div>
        <Link 
          href="/dashboard/leaves/settings" 
          className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-md transition-colors"
        >
          Manage Leave Types &rarr;
        </Link>
      </div>

      {/* Add Leave Request Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Log New Leave Request</h2>
        
        {!hasLeaveTypes ? (
          <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md text-sm border border-yellow-200">
            <strong>Action Required:</strong> You cannot create a leave request yet because no Leave Types exist. <br/>
            Please configure your Leave Types (e.g., Annual Leave, Sick Leave) first.
          </div>
        ) : (
          <form action={createLeaveRequest} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
              <select name="employee_id" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500">
                <option value="">-- Select Employee --</option>
                {employees?.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name} ({emp.companies?.name || 'No Company'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type *</label>
              <select name="leave_type_id" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500">
                <option value="">-- Select Type --</option>
                {leaveTypes?.map((lt) => (
                  <option key={lt.id} value={lt.id}>
                    {lt.name} ({lt.companies?.name || 'No Company'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Days *</label>
              <input type="number" step="0.5" min="0.5" name="total_days" required placeholder="e.g. 2" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input type="date" name="start_date" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
              <input type="date" name="end_date" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500" />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason / Notes *</label>
              <textarea name="reason" rows={2} required placeholder="Why is this leave being requested?" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500" />
            </div>

            <div className="md:col-span-2 lg:col-span-3 flex justify-end">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-md text-sm transition-colors">
                Submit Request
              </button>
            </div>
          </form>
        )}
      </div>

      <LeaveTable requests={requests} />
    </div>
  )
}
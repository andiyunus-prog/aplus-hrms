import { createClient } from '../../../../utils/supabase/server'
import { createLeaveType } from './actions'
import LeaveTypesTable from './leave-types-table'
import Link from 'next/link'

type CompanyOption = {
  id: string
  name: string | null
  legal_name: string | null
}

type LeaveTypeItem = {
  id: string
  company_id: string
  name: string
  code: string
  description: string | null
  days_allowed: number
  is_active: boolean
  companies: {
    name: string | null
    legal_name: string | null
  } | null
}

export default async function LeaveSettingsPage() {
  const supabase = await createClient()

  // Fetch companies for selection
  const { data: rawCompanies } = await supabase
    .from('companies')
    .select('id, name, legal_name')
    .order('legal_name', { ascending: true })

  const companies = rawCompanies as unknown as CompanyOption[]

  // Fetch leave types
  const { data: rawLeaveTypes } = await supabase
    .from('leave_types')
    .select('*, companies(name, legal_name)')
    .order('created_at', { ascending: false })

  const leaveTypes = rawLeaveTypes as unknown as LeaveTypeItem[]

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/leaves"
          className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2"
        >
          &larr; Back to Leave Requests
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Leave Type Settings</h1>
        <p className="text-gray-500 mt-1">Configure time-off categories and yearly quotas for your companies.</p>
      </div>

      {/* Add Leave Type Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Create New Leave Type</h2>
        <form action={createLeaveType} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
            <select
              name="company_id"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Company --</option>
              {companies?.map((comp) => (
                <option key={comp.id} value={comp.id}>
                  {comp.legal_name || comp.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Leave Name *</label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Annual Leave, Sick Leave"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
            <input
              type="text"
              name="code"
              required
              placeholder="e.g. AL, SL, ML"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Days Allowed / Year *</label>
            <input
              type="number"
              name="days_allowed"
              required
              min="0"
              defaultValue="12"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              rows={2}
              placeholder="Optional notes or eligibility criteria..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-md text-sm transition-colors"
            >
              Save Leave Type
            </button>
          </div>
        </form>
      </div>

      <LeaveTypesTable leaveTypes={leaveTypes || []} />
    </div>
  )
}
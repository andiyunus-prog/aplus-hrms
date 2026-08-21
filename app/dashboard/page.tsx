export const dynamic = 'force-dynamic'

import { createClient } from '../../utils/supabase/server'
import Link from 'next/link'

type RecentEmployee = {
  id: string
  full_name: string
  employee_code: string
  department: string | null
  companies: {
    name: string | null
    legal_name: string | null
  } | null
}

export default async function DashboardOverview() {
  const supabase = await createClient()

  // 1. Fetch counts
  const { count: companyCount } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true })

  const { count: employeeCount } = await supabase
    .from('employees')
    .select('*', { count: 'exact', head: true })

  const { count: activeEmployeeCount } = await supabase
    .from('employees')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'ACTIVE')

  // 2. Fetch pending loan requests count
  const { count: pendingLoansCount } = await supabase
    .from('employee_loans')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'PENDING')

  // 3. Fetch recent employees
  const { data } = await supabase
    .from('employees')
    .select('id, full_name, employee_code, department, companies(name, legal_name)')
    .order('created_at', { ascending: false })
    .limit(5)

  const recentEmployees = data as unknown as RecentEmployee[]

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here is what is happening across your organizations.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col">
          <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Companies</span>
          <span className="text-4xl font-bold text-blue-700 mt-2">{companyCount || 0}</span>
          <Link href="/dashboard/companies" className="text-sm text-blue-600 hover:underline mt-4">Manage companies &rarr;</Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col">
          <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Employees</span>
          <span className="text-4xl font-bold text-blue-700 mt-2">{employeeCount || 0}</span>
          <Link href="/dashboard/employees" className="text-sm text-blue-600 hover:underline mt-4">Manage employees &rarr;</Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col">
          <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Employees</span>
          <span className="text-4xl font-bold text-emerald-600 mt-2">{activeEmployeeCount || 0}</span>
          <span className="text-sm text-gray-400 mt-4">Currently active workforce</span>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col">
          <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pending Loans</span>
          <span className="text-4xl font-bold text-yellow-600 mt-2">{pendingLoansCount || 0}</span>
          <Link href="/dashboard/loans" className="text-sm text-blue-600 hover:underline mt-4">Review requests &rarr;</Link>
        </div>
      </div>

      {/* Quick Financial & Payroll Actions Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-blue-900">Payroll & Financial Quick Links</h3>
          <p className="text-sm text-blue-700 mt-0.5">Quickly jump to payroll calculation, payslips, or review employee loans.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/payroll" className="bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm">
            Payroll & Payslips
          </Link>
          <Link href="/dashboard/loans" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm">
            Employee Loans
          </Link>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Recently Added Employees</h2>
          <Link href="/dashboard/employees" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View all
          </Link>
        </div>
        <div className="divide-y divide-gray-200">
          {recentEmployees && recentEmployees.length > 0 ? (
            recentEmployees.map((emp) => (
              <div key={emp.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">{emp.full_name}</p>
                  <p className="text-xs text-gray-500">
                    Code: {emp.employee_code} • {emp.department || 'No Dept'}
                  </p>
                </div>
                <div className="text-sm text-gray-500 text-right">
                  {emp.companies ? (emp.companies.legal_name || emp.companies.name) : '-'}
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-gray-400 text-sm">
              No employees added yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
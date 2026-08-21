export const dynamic = 'force-dynamic'

import { createClient } from '../../../utils/supabase/server'
import { generatePayslip } from './actions'
import PayslipTable from './payslip-table'
import Link from 'next/link'
import { requireOwnerPage } from '../../../utils/supabase/auth'

export default async function PayrollOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string; search?: string }>
}) {
  await requireOwnerPage() // <-- SECURED WITH ONE CLEAN LINE

  const supabase = await createClient()
  const resolvedParams = await searchParams

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const selectedMonth = resolvedParams.month ? parseInt(resolvedParams.month, 10) : currentMonth
  const selectedYear = resolvedParams.year ? parseInt(resolvedParams.year, 10) : currentYear
  const searchTerm = resolvedParams.search || ''

  // 1. Fetch active employees for the generator dropdown
  const { data: rawEmployees } = await supabase
    .from('employees')
    .select('id, full_name, companies(name)')
    .order('full_name')

  // 2. Build dynamic query for historical payslips
  let query = supabase
    .from('payslips')
    .select(`
      *,
      employees (full_name, employee_code, companies(name))
    `)
    .order('period_year', { ascending: false })
    .order('period_month', { ascending: false })
    .order('created_at', { ascending: false })

  if (selectedMonth) {
    query = query.eq('period_month', selectedMonth)
  }
  if (selectedYear) {
    query = query.eq('period_year', selectedYear)
  }

  const { data: rawPayslips, error } = await query

  if (error) {
    console.error('Error fetching payslip history:', error.message)
  }

  const employees = rawEmployees as any[] || []
  let payslips = rawPayslips as any[] || []

  // Client-side text filter for employee name/code if search query exists
  if (searchTerm.trim() !== '') {
    const term = searchTerm.toLowerCase()
    payslips = payslips.filter((ps) => 
      ps.employees?.full_name?.toLowerCase().includes(term) ||
      ps.employees?.employee_code?.toLowerCase().includes(term)
    )
  }

  // Generate year options (e.g., 2024 to 2030)
  const years = Array.from({ length: 7 }, (_, i) => 2024 + i)

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll & Historical Archive</h1>
          <p className="text-gray-500 mt-1">Generate new drafts and audit historical monthly payslips.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/payroll/salaries" className="text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-md transition-colors">
            Manage Base Salaries
          </Link>
          <Link href="/dashboard/payroll/settings" className="text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-md transition-colors">
            Payroll Settings &rarr;
          </Link>
        </div>
      </div>

      {/* Generate Payslip Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Generate New Payslip</h2>
        
        <form action={generatePayslip} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
            <select name="employee_id" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500">
              <option value="">-- Select Employee --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name} ({emp.companies?.name || 'No Company'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month *</label>
            <select name="period_month" defaultValue={currentMonth} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500">
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('en-US', { month: 'long' })}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
            <input type="number" name="period_year" defaultValue={currentYear} required min="2020" max="2100" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500" />
          </div>

          <div className="md:col-span-4 flex justify-end mt-2">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md text-sm transition-colors">
              Generate Draft
            </button>
          </div>
        </form>
      </div>

      {/* HISTORICAL ARCHIVE FILTER BAR */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-md font-semibold text-gray-800">Payslip History Archive</h2>
          {/* View Monthly Summary Button */}
          <Link 
            href={`/dashboard/payroll/summary/${selectedYear}/${selectedMonth}`}
            className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded font-medium hover:bg-indigo-100 transition-colors"
          >
            View Monthly Summary &rarr;
          </Link>
        </div>
        
        <form method="GET" className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Month Filter */}
          <select 
            name="month" 
            defaultValue={selectedMonth || ''} 
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm bg-white focus:ring-blue-500"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('en-US', { month: 'long' })}</option>
            ))}
          </select>

          {/* Year Filter */}
          <select 
            name="year" 
            defaultValue={selectedYear} 
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm bg-white focus:ring-blue-500"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {/* Employee Search Filter */}
          <input 
            type="text" 
            name="search" 
            defaultValue={searchTerm} 
            placeholder="Filter employee..." 
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:ring-blue-500 w-36 sm:w-44"
          />

          <button type="submit" className="bg-gray-800 hover:bg-gray-900 text-white text-sm px-4 py-1.5 rounded-md transition-colors">
            Filter
          </button>

          {searchTerm && (
            <Link href="/dashboard/payroll" className="text-xs text-gray-500 hover:text-gray-800 underline">
              Reset
            </Link>
          )}
        </form>
      </div>

      <PayslipTable payslips={payslips} />
    </div>
  )
}
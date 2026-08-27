export const dynamic = 'force-dynamic'

import { createClient } from '../../../../utils/supabase/server'
import { getCurrentUserRole } from '../../../../utils/supabase/auth'
import { redirect } from 'next/navigation'
import { saveLatenessRecords } from './actions'
import Link from 'next/link'


export default async function AttendanceLatenessPage({
  
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>
}) {
  const userRole = await getCurrentUserRole()
  if (userRole !== 'OWNER' && userRole !== 'ADMIN' && userRole !== 'HRD') {
    redirect('/dashboard')
  }

  const supabase = await createClient()
  const resolvedParams = await searchParams

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const selectedMonth = resolvedParams.month ? parseInt(resolvedParams.month, 10) : currentMonth
  const selectedYear = resolvedParams.year ? parseInt(resolvedParams.year, 10) : currentYear

  // 1. Fetch active employees
  const { data: employees } = await supabase
    .from('employees')
    .select('id, full_name, employee_code, department')
    .eq('status', 'ACTIVE')
    .order('full_name')

  // 2. Fetch existing lateness entries for this specific month/year
  const { data: existingLateness } = await supabase
    .from('employee_lateness')
    .select('*')
    .eq('period_month', selectedMonth)
    .eq('period_year', selectedYear)

  const latenessMap = new Map()
  existingLateness?.forEach(item => {
    latenessMap.set(item.employee_id, item)
  })

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
  }

  const years = Array.from({ length: 7 }, (_, i) => 2024 + i)

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline mb-2 inline-block">&larr; Back to Dashboard</Link>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Lateness & Deductions</h1>
          <p className="text-gray-500 mt-1">First 60 minutes are free (Buffer). Every minute past 60 incurs a Rp 1.000 deduction.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <form method="GET" className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Select Period:</span>
          
          <select 
            name="month" 
            defaultValue={selectedMonth} 
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm bg-white focus:ring-blue-500"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('en-US', { month: 'long' })}</option>
            ))}
          </select>

          <select 
            name="year" 
            defaultValue={selectedYear} 
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm bg-white focus:ring-blue-500"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <button type="submit" className="bg-gray-800 hover:bg-gray-900 text-white text-sm px-4 py-1.5 rounded-md transition-colors">
            Load Period
          </button>
        </form>
      </div>

      {/* Main Form & Table */}
      <form action={saveLatenessRecords} className="space-y-6">
        <input type="hidden" name="period_month" value={selectedMonth} />
        <input type="hidden" name="period_year" value={selectedYear} />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">
              Employee Lateness for {new Date(0, selectedMonth - 1).toLocaleString('en-US', { month: 'long' })} {selectedYear}
            </h2>
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-md shadow-sm transition-colors"
            >
              Save All Lateness Data
            </button>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                <th className="px-6 py-3">Employee Name & Code</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3 w-44">Late Minutes (Input)</th>
                <th className="px-6 py-3">Calculated Deduction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {employees && employees.length > 0 ? (
                employees.map((emp) => {
                  const record = latenessMap.get(emp.id)
                  const currentMinutes = record ? record.late_minutes : 0
                  const currentDeduction = record ? record.deduction_amount : 0

                  return (
                    <tr key={emp.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {emp.full_name}
                        <p className="text-xs text-gray-400">Code: {emp.employee_code}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {emp.department || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          type="number" 
                          name={`late_minutes_${emp.id}`} 
                          defaultValue={currentMinutes} 
                          min="0" 
                          placeholder="e.g. 75" 
                          className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm bg-white focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 font-semibold text-red-600">
                        {formatIDR(Number(currentDeduction))}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                    No active employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-2 rounded-md shadow-sm transition-colors"
            >
              Save All Lateness Data
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
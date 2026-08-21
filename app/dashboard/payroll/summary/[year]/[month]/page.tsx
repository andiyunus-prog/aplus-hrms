export const dynamic = 'force-dynamic'

import { createClient } from '../../../../../../utils/supabase/server'
import Link from 'next/link'

type Props = {
  params: Promise<{ year: string; month: string }>
}

export default async function MonthlyPayrollSummaryPage({ params }: Props) {
  const { year, month } = await params
  const parsedYear = parseInt(year, 10)
  const parsedMonth = parseInt(month, 10)

  const supabase = await createClient()

  // 1. Find the payroll run for this specific month/year
  const { data: payrollRun } = await supabase
    .from('payrolls')
    .select('*')
    .eq('period_year', parsedYear)
    .eq('period_month', parsedMonth)
    .single()

  if (!payrollRun) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-4">
        <Link href="/dashboard/payroll" className="text-sm text-blue-600 hover:underline">&larr; Back to Payroll</Link>
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center text-gray-500">
          No payroll record found for {parsedMonth}/{parsedYear}.
        </div>
      </div>
    )
  }

  // 2. Fetch all payroll items (employee line items) for this payroll run
  const { data: items } = await supabase
    .from('payroll_items')
    .select(`
      *,
      employees (full_name, employee_code, department)
    `)
    .eq('payroll_id', payrollRun.id)

  const monthsList = [
    '', 'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const totalPayout = items?.reduce((sum, item) => sum + Number(item.net_salary || 0), 0) || 0

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard/payroll" className="text-sm text-blue-600 hover:underline mb-2 inline-block">&larr; Back to Payroll Dashboard</Link>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Payroll Summary: {monthsList[parsedMonth]} {parsedYear}
            </h1>
            <p className="text-sm text-gray-500 mt-1">Detailed breakdown of all employee payouts and deductions for this period.</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            payrollRun.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {payrollRun.status}
          </span>
        </div>
      </div>

      {/* Summary Banner Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex justify-between items-center">
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Total Monthly Expenditure</span>
          <p className="text-2xl font-bold text-blue-900 mt-1">Rp {totalPayout.toLocaleString('id-ID')}</p>
        </div>
        <div className="text-right text-sm text-blue-700">
          <p>Total Employees Paid: <span className="font-semibold">{items?.length || 0}</span></p>
        </div>
      </div>

      {/* Detailed List Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Itemized Payout List</h2>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
              <th className="px-6 py-3">#</th>
              <th className="px-6 py-3">Employee</th>
              <th className="px-6 py-3">Base Salary</th>
              <th className="px-6 py-3">Allowances</th>
              <th className="px-6 py-3">Loan Deduction</th>
              <th className="px-6 py-3 text-right">Net Take Home Pay</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {items && items.length > 0 ? (
              items.map((item: any, index: number) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-400 font-medium">{index + 1}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {item.employees?.full_name || 'Unknown Employee'}
                    <span className="block text-xs text-gray-400">Code: {item.employees?.employee_code || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    Rp {Number(item.base_salary).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    Rp {Number(item.total_allowances || 0).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-orange-600 font-medium">
                    - Rp {Number(item.loan_deduction || 0).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">
                    Rp {Number(item.net_salary).toLocaleString('id-ID')}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  No payroll items recorded for this month.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
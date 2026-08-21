'use client'

import Link from 'next/link'
import { deletePayslip } from './actions'

type Payslip = {
  id: string
  period_month: number
  period_year: number
  base_salary: number
  net_salary: number
  status: string
  employees: {
    full_name: string
    employee_code: string
    companies: { name: string | null } | null
  } | null
}

export default function PayslipTable({ payslips }: { payslips: Payslip[] }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
  }

  const getMonthName = (monthNumber: number) => {
    const date = new Date()
    date.setMonth(monthNumber - 1)
    return date.toLocaleString('en-US', { month: 'long' })
  }

  // Calculate grand total net payouts for the filtered archive view
  const totalPayout = payslips.reduce((acc, curr) => acc + Number(curr.net_salary || 0), 0)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
        <div>
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Results ({payslips.length} records)</h3>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-500 mr-2">Total Net Payout:</span>
          <span className="text-sm font-bold text-gray-900">{formatCurrency(totalPayout)}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-3">Period</th>
              <th className="px-6 py-3">Employee</th>
              <th className="px-6 py-3">Base Salary</th>
              <th className="px-6 py-3">Net Salary</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
            {payslips.length > 0 ? (
              payslips.map((ps) => (
                <tr key={ps.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {getMonthName(ps.period_month)} {ps.period_year}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{ps.employees?.full_name}</div>
                    <div className="text-xs text-gray-500">{ps.employees?.companies?.name || 'No Company'}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {formatCurrency(ps.base_salary)}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">
                    {formatCurrency(ps.net_salary)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide ${
                      ps.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {ps.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <Link href={`/dashboard/payroll/${ps.id}`} className="text-blue-600 hover:text-blue-800 text-xs font-medium mr-3">
                      View / Edit
                    </Link>
                    <form action={deletePayslip} className="inline-block border-l pl-3 border-gray-200">
                      <input type="hidden" name="id" value={ps.id} />
                      <button type="submit" className="text-gray-400 hover:text-red-600 text-xs font-medium">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  No historical payslips found for this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
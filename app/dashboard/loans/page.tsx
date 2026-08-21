export const dynamic = 'force-dynamic'

import { createClient } from '../../../utils/supabase/server'
import { requestLoan, updateLoanStatus } from './actions'
import Link from 'next/link'
import { requireOwnerPage } from '../../../utils/supabase/auth'

export default async function LoansPage() {
  await requireOwnerPage() // <-- SECURED WITH ONE CLEAN LINE

  const supabase = await createClient()

  // 1. Fetch active employees for the dropdown
  const { data: employees } = await supabase
    .from('employees')
    .select('id, full_name, employee_code')
    .eq('status', 'ACTIVE')
    .order('full_name', { ascending: true })

  // 2. Fetch raw loans directly
  const { data: loans, error: loanError } = await supabase
    .from('employee_loans')
    .select('*')
    .order('created_at', { ascending: false })

  if (loanError) {
    console.error('Error fetching loans:', loanError.message)
  }

  // 3. Fetch all employees to map names cleanly in JS
  const { data: allEmployees } = await supabase
    .from('employees')
    .select('id, full_name, employee_code, department')

  const employeeMap = new Map()
  allEmployees?.forEach(emp => {
    employeeMap.set(emp.id, emp)
  })

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Loan & Cash Advance Management</h1>
        <p className="text-gray-500 mt-1">Request employee loans, review schedules, and manage monthly payroll deductions.</p>
      </div>

      {/* Request Loan Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Request New Loan</h2>
        <form action={requestLoan} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Employee</label>
            <select name="employee_id" required className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white">
              <option value="">Select Employee</option>
              {employees?.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name} ({emp.employee_code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Total Amount (Rp)</label>
            <input type="number" name="amount" placeholder="e.g. 3000000" required className="w-full border border-gray-300 rounded-md p-2 text-sm" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Tenor (Months)</label>
            <input type="number" name="tenor_months" placeholder="e.g. 3" min="1" required className="w-full border border-gray-300 rounded-md p-2 text-sm" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Purpose</label>
            <input type="text" name="purpose" placeholder="e.g. Medical / Emergency" className="w-full border border-gray-300 rounded-md p-2 text-sm" />
          </div>

          <div className="md:col-span-4 flex justify-end">
            <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
              Submit Loan Request
            </button>
          </div>
        </form>
      </div>

      {/* Loan List Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">All Loan Requests ({loans?.length || 0})</h2>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
              <th className="px-6 py-3">Employee</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Tenor / Installment</th>
              <th className="px-6 py-3">Purpose</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {loans && loans.length > 0 ? (
              loans.map((loan) => {
                const emp = employeeMap.get(loan.employee_id)
                return (
                  <tr key={loan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <Link href={`/dashboard/loans/${loan.id}`} className="hover:text-blue-600 hover:underline">
                        {emp?.full_name || 'Unknown Employee'}
                      </Link>
                      <p className="text-xs text-gray-400">Code: {emp?.employee_code || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-700 font-medium">
                      Rp {Number(loan.amount).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {loan.tenor_months} Mos (~Rp {Number(loan.monthly_installment).toLocaleString('id-ID')}/mo)
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {loan.purpose || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        loan.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        loan.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        loan.status === 'DISBURSED' ? 'bg-blue-100 text-blue-800' :
                        loan.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {loan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                      {/* PENDING ACTIONS */}
                      {loan.status === 'PENDING' && (
                        <>
                          <form action={updateLoanStatus} className="inline">
                            <input type="hidden" name="id" value={loan.id} />
                            <input type="hidden" name="status" value="APPROVED" />
                            <button type="submit" className="text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded font-medium hover:bg-green-100">
                              Approve
                            </button>
                          </form>
                          <form action={updateLoanStatus} className="inline">
                            <input type="hidden" name="id" value={loan.id} />
                            <input type="hidden" name="status" value="REJECTED" />
                            <button type="submit" className="text-xs bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded font-medium hover:bg-red-100">
                              Reject
                            </button>
                          </form>
                        </>
                      )}

                      {/* APPROVED ACTIONS */}
                      {loan.status === 'APPROVED' && (
                        <form action={updateLoanStatus} className="inline">
                          <input type="hidden" name="id" value={loan.id} />
                          <input type="hidden" name="status" value="DISBURSED" />
                          <button type="submit" className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded font-medium hover:bg-blue-100">
                            Disburse
                          </button>
                        </form>
                      )}

                      {/* SCHEDULE LINK */}
                      <Link href={`/dashboard/loans/${loan.id}`} className="text-xs bg-gray-50 text-gray-700 border border-gray-200 px-2.5 py-1 rounded font-medium hover:bg-gray-100 inline-block">
                        Schedule &rarr;
                      </Link>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  No loan requests found in database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
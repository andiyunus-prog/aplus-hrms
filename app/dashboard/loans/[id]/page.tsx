export const dynamic = 'force-dynamic'

import { createClient } from '../../../../utils/supabase/server'
import { updateInstallmentStatus } from './actions'
import Link from 'next/link'
import { requireOwnerPage } from '../../../../utils/supabase/auth'

type Props = {
  params: Promise<{ id: string }>
}

export default async function LoanDetailPage({ params }: Props) {
  await requireOwnerPage() // <-- SECURED WITH ONE CLEAN LINE

  const supabase = await createClient()
  const { id } = await params

  // 1. Fetch loan info directly without risky joins
  const { data: loan } = await supabase
    .from('employee_loans')
    .select('*')
    .eq('id', id)
    .single()

  if (!loan) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-4">
        <Link href="/dashboard/loans" className="text-sm text-blue-600 hover:underline">&larr; Back to Loans</Link>
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center text-gray-500">
          Loan not found (ID: {id}).
        </div>
      </div>
    )
  }

  // 2. Fetch employee details separately
  const { data: employee } = await supabase
    .from('employees')
    .select('full_name, employee_code, department')
    .eq('id', loan.employee_id)
    .single()

  // 3. Fetch installment schedule for this loan
  const { data: installments } = await supabase
    .from('employee_loan_installments')
    .select('*')
    .eq('loan_id', id)
    .order('period_year', { ascending: true })
    .order('period_month', { ascending: true })

  const monthsList = [
    '', 'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/loans" className="text-sm text-blue-600 hover:underline mb-2 inline-block">&larr; Back to Loans</Link>
          <h1 className="text-2xl font-bold text-gray-900">Loan Details & Schedule</h1>
          <p className="text-sm text-gray-500">Employee: {employee?.full_name || 'Unknown'} ({employee?.employee_code || 'N/A'})</p>
        </div>
        <div className="text-right">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            loan.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
            loan.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
            loan.status === 'DISBURSED' ? 'bg-blue-100 text-blue-800' :
            loan.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {loan.status}
          </span>
        </div>
      </div>

      {/* Summary Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div>
          <span className="text-xs text-gray-400 uppercase">Total Amount</span>
          <p className="text-xl font-bold text-gray-900">Rp {Number(loan.amount).toLocaleString('id-ID')}</p>
        </div>
        <div>
          <span className="text-xs text-gray-400 uppercase">Tenor</span>
          <p className="text-xl font-bold text-gray-900">{loan.tenor_months} Months</p>
        </div>
        <div>
          <span className="text-xs text-gray-400 uppercase">Purpose</span>
          <p className="text-sm text-gray-700 mt-1">{loan.purpose || '-'}</p>
        </div>
      </div>

      {/* Installment Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Installment Schedule</h2>
          <p className="text-xs text-gray-500">You can skip an upcoming payment month if the employee requests an urgent waiver.</p>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
              <th className="px-6 py-3">Month / Year</th>
              <th className="px-6 py-3">Installment Amount</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {installments && installments.length > 0 ? (
              installments.map((inst: any) => (
                <tr key={inst.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {monthsList[inst.period_month]} {inst.period_year}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    Rp {Number(inst.amount).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      inst.status === 'PAID' ? 'bg-blue-100 text-blue-800' :
                      inst.status === 'SKIPPED' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {inst.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {inst.status === 'UNPAID' && (
                      <form action={updateInstallmentStatus} className="inline">
                        <input type="hidden" name="installment_id" value={inst.id} />
                        <input type="hidden" name="loan_id" value={loan.id} />
                        <input type="hidden" name="status" value="SKIPPED" />
                        <button type="submit" className="text-xs text-orange-600 hover:text-orange-900 font-medium bg-orange-50 px-3 py-1 rounded border border-orange-200">
                          Skip Month
                        </button>
                      </form>
                    )}
                    {inst.status === 'SKIPPED' && (
                      <form action={updateInstallmentStatus} className="inline">
                        <input type="hidden" name="installment_id" value={inst.id} />
                        <input type="hidden" name="loan_id" value={loan.id} />
                        <input type="hidden" name="status" value="UNPAID" />
                        <button type="submit" className="text-xs text-blue-600 hover:text-blue-900 font-medium bg-blue-50 px-3 py-1 rounded border border-blue-200">
                          Resume Deduction
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                  No installment schedule generated yet. (Approve the loan first to generate installments).
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
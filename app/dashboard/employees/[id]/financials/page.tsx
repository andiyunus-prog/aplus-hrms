export const dynamic = 'force-dynamic'

import { createClient } from '../../../../../utils/supabase/server'
import Link from 'next/link'
import { requireOwnerPage } from '../../../../../utils/supabase/auth'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EmployeeFinancialProfilePage({ params }: Props) {
  await requireOwnerPage() // <-- SECURED: BLOCKS HRD USERS INSTANTLY

  const { id } = await params
  const supabase = await createClient()

  // 1. Fetch Employee Info
  const { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single()

  if (!employee) {
    return <div className="p-8">Employee not found.</div>
  }

  // 2. Fetch All Loans for this Employee
  const { data: loans } = await supabase
    .from('employee_loans')
    .select('*')
    .eq('employee_id', id)
    .order('created_at', { ascending: false })

  const loanIds = loans?.map(l => l.id) || []

  // 3. Fetch All Installments for these Loans
  let installments: any[] = []
  if (loanIds.length > 0) {
    const { data: instData } = await supabase
      .from('employee_loan_installments')
      .select('*')
      .in('loan_id', loanIds)
    installments = instData || []
  }

  // 4. Fetch Payslip History matching your schema (`payslips` table)
  const { data: payslips } = await supabase
    .from('payslips')
    .select(`
      *,
      payslip_items (*)
    `)
    .eq('employee_id', id)
    .order('period_year', { ascending: false })
    .order('period_month', { ascending: false })

  // --- ACCURATE CALCULATIONS ---
  const activeOrDisbursedLoans = loans?.filter(l => l.status === 'APPROVED' || l.status === 'DISBURSED') || []
  const activeOrDisbursedLoanIds = new Set(activeOrDisbursedLoans.map(l => l.id))

  const totalLoanBorrowed = activeOrDisbursedLoans.reduce((acc, l) => acc + Number(l.amount), 0)

  const activeInstallments = installments.filter(i => activeOrDisbursedLoanIds.has(i.loan_id))

  const totalLoanLeft = activeInstallments
    .filter(i => i.status === 'UNPAID' || i.status === 'SKIPPED')
    .reduce((acc, i) => acc + Number(i.amount), 0)
  
  const totalPaidSoFar = activeInstallments
    .filter(i => i.status === 'PAID')
    .reduce((acc, i) => acc + Number(i.amount), 0)

  const monthsList = [
    '', 'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link href="/dashboard/employees" className="text-sm text-blue-600 hover:underline mb-2 inline-block">&larr; Back to Employees</Link>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{employee.full_name}</h1>
            <p className="text-sm text-gray-500">Code: {employee.employee_code} | Department: {employee.department || '-'} | Position: {employee.position || '-'}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            employee.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {employee.status}
          </span>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <span className="text-xs font-medium text-gray-400 uppercase">Base Salary</span>
          <p className="text-xl font-bold text-gray-900 mt-1">Rp {Number(employee.base_salary || 0).toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <span className="text-xs font-medium text-gray-400 uppercase">Total Approved Loans</span>
          <p className="text-xl font-bold text-gray-900 mt-1">Rp {totalLoanBorrowed.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <span className="text-xs font-medium text-gray-400 uppercase">Total Loan Paid</span>
          <p className="text-xl font-bold text-green-600 mt-1">Rp {totalPaidSoFar.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <span className="text-xs font-medium text-gray-400 uppercase">Total Debt Remaining</span>
          <p className="text-xl font-bold text-orange-600 mt-1">Rp {totalLoanLeft.toLocaleString('id-ID')}</p>
        </div>
      </div>

      {/* Loans & Audit Trail Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Loan History & Audit Trail</h2>
          <Link href="/dashboard/loans" className="text-xs text-blue-600 hover:underline font-medium">Manage Loans &rarr;</Link>
        </div>
        <div className="p-6 space-y-6">
          {loans && loans.length > 0 ? (
            loans.map((loan) => {
              const loanInsts = installments.filter(i => i.loan_id === loan.id)
              const paidCount = loanInsts.filter(i => i.status === 'PAID').length
              const totalCount = loanInsts.length

              const requestedDate = new Date(loan.created_at).toLocaleString('en-GB', {
                dateStyle: 'medium',
                timeStyle: 'short'
              })
              const updatedDate = loan.updated_at ? new Date(loan.updated_at).toLocaleString('en-GB', {
                dateStyle: 'medium',
                timeStyle: 'short'
              }) : null

              return (
                <div key={loan.id} className="border border-gray-200 rounded-lg p-5 bg-gray-50/50 space-y-4">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-gray-900">Rp {Number(loan.amount).toLocaleString('id-ID')}</span>
                        <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                          loan.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          loan.status === 'DISBURSED' ? 'bg-blue-100 text-blue-800' :
                          loan.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>{loan.status}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Purpose: {loan.purpose || '-'} | Tenor: {loan.tenor_months} Months</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded p-2.5 text-xs text-gray-600 space-y-1 w-full md:w-72 shadow-2xs">
                      <p className="font-semibold text-gray-700 border-b pb-1">Audit Record & Timeline</p>
                      <p><span className="text-gray-400">Requested:</span> {requestedDate}</p>
                      {updatedDate && loan.status !== 'PENDING' && (
                        <p><span className="text-gray-400">Status Changed:</span> {updatedDate} ({loan.status})</p>
                      )}
                      <p><span className="text-gray-400">Loan ID:</span> <span className="font-mono text-[10px]">{loan.id}</span></p>
                    </div>
                  </div>

                  {/* Sub-table for installments */}
                  {loanInsts.length > 0 && (
                    <div className="bg-white rounded border border-gray-200 overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-gray-100 border-b border-gray-200 text-gray-500">
                            <th className="px-4 py-2">Installment Period</th>
                            <th className="px-4 py-2">Amount</th>
                            <th className="px-4 py-2">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {loanInsts.map((inst) => (
                            <tr key={inst.id}>
                              <td className="px-4 py-2 font-medium">{monthsList[inst.period_month]} {inst.period_year}</td>
                              <td className="px-4 py-2">Rp {Number(inst.amount).toLocaleString('id-ID')}</td>
                              <td className="px-4 py-2">
                                <span className={`px-2 py-0.5 rounded font-semibold ${
                                  inst.status === 'PAID' ? 'bg-blue-100 text-blue-800' :
                                  inst.status === 'SKIPPED' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {inst.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">No loan history found for this employee.</p>
          )}
        </div>
      </div>

      {/* Payslip History Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Payslip History Archive</h2>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
              <th className="px-6 py-3">Period</th>
              <th className="px-6 py-3">Base Salary</th>
              <th className="px-6 py-3">Total Earnings</th>
              <th className="px-6 py-3">Total Deductions</th>
              <th className="px-6 py-3">Net Take Home Pay</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {payslips && payslips.length > 0 ? (
              payslips.map((ps: any) => (
                <tr key={ps.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {monthsList[ps.period_month]} {ps.period_year}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    Rp {Number(ps.base_salary).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    Rp {Number(ps.total_earnings || 0).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-orange-600 font-medium">
                    - Rp {Number(ps.total_deductions || 0).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-green-700 font-bold">
                    Rp {Number(ps.net_salary).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      ps.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {ps.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  No payslip history found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
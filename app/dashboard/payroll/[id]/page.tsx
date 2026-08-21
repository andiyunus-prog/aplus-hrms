export const dynamic = 'force-dynamic'

import { createClient } from '../../../../utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { addPayslipItem, deletePayslipItem, markAsPaid } from './actions'
import { requireOwnerPage } from '../../../../utils/supabase/auth'

type SalaryComponentOption = {
  id: string
  name: string
  type: string
}

export default async function PayslipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireOwnerPage() // <-- SECURED WITH ONE CLEAN LINE

  const supabase = await createClient()
  const { id } = await params

  // 1. Fetch the payslip with relations and employee company ID
  const { data: payslip } = await supabase
    .from('payslips')
    .select(`
      *,
      employees (
        id, full_name, employee_code, department, company_id,
        companies (name, legal_name)
      ),
      payslip_items (*)
    `)
    .eq('id', id)
    .single()

  if (!payslip) notFound()

  // 2. Fetch lateness deduction for this specific employee, month, and year
  const { data: latenessRecord } = await supabase
    .from('employee_lateness')
    .select('*')
    .eq('employee_id', payslip.employee_id)
    .eq('period_month', payslip.period_month)
    .eq('period_year', payslip.period_year)
    .single()

  const latenessDeductionAmount = Number(latenessRecord?.deduction_amount || 0)
  const latenessMinutes = Number(latenessRecord?.late_minutes || 0)

  // 3. Fetch all salary components for this specific employee's company
  const companyId = payslip.employees?.company_id
  let companyComponents: SalaryComponentOption[] = []

  if (companyId) {
    const { data: comps } = await supabase
      .from('salary_components')
      .select('id, name, type')
      .eq('company_id', companyId)
      .order('name')
    
    companyComponents = comps || []
  }

  // Format currency
  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
  }

  // Format month
  const getMonthName = (monthNumber: number) => {
    return new Date(0, monthNumber - 1).toLocaleString('en-US', { month: 'long' })
  }

  // Filter items
  const earnings = payslip.payslip_items?.filter((i: any) => i.type === 'EARNING') || []
  const manualDeductions = payslip.payslip_items?.filter((i: any) => i.type === 'DEDUCTION') || []

  // Combine manual deductions with the automated Lateness Deduction item (if any penalty applies)
  const deductions = [
    ...manualDeductions,
    ...(latenessDeductionAmount > 0 ? [{
      id: 'lateness-auto-deduction',
      name: `Attendance Lateness Penalty (${latenessMinutes} mins total, >60m buffer)`,
      amount: latenessDeductionAmount,
      type: 'DEDUCTION',
      isAuto: true
    }] : [])
  ]

  // Calculate accurate totals including lateness penalty
  const baseSalaryNum = Number(payslip.base_salary)
  const totalEarningsNum = earnings.reduce((sum: number, item: any) => sum + Number(item.amount), 0)
  const grossEarnings = baseSalaryNum + Number(payslip.total_earnings || totalEarningsNum)

  const manualDeductionsTotal = manualDeductions.reduce((sum: number, item: any) => sum + Number(item.amount), 0)
  const totalDeductionsAll = manualDeductionsTotal + latenessDeductionAmount
  const calculatedNetSalary = grossEarnings - totalDeductionsAll

  // Separate company components into earnings for the dropdowns
  const availableEarnings = companyComponents.filter(c => c.type === 'EARNING')

  const isPaid = payslip.status === 'PAID'

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard/payroll" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2">
          &larr; Back to Payroll
        </Link>
        <span className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wide ${
          isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {isPaid ? `PAID on ${new Date(payslip.payment_date).toLocaleDateString()}` : 'DRAFT'}
        </span>
      </div>

      {/* Header Info */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payslip: {getMonthName(payslip.period_month)} {payslip.period_year}</h1>
          <p className="text-gray-500 mt-1">
            <span className="font-medium text-gray-700">{payslip.employees?.full_name}</span> • 
            Code: {payslip.employees?.employee_code} • 
            {payslip.employees?.companies?.name}
          </p>
        </div>
        
        {/* Action Button */}
        {!isPaid && (
          <form action={markAsPaid}>
            <input type="hidden" name="id" value={payslip.id} />
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2.5 rounded-md transition-colors shadow-sm">
              Mark as PAID
            </button>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT COLUMN: EARNINGS */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800">Earnings</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Base Salary</span>
                <span className="font-semibold text-gray-900">{formatIDR(payslip.base_salary)}</span>
              </div>
              
              {earnings.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center group">
                  <div className="flex items-center gap-2">
                    {!isPaid && (
                      <form action={deletePayslipItem} className="inline">
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="payslip_id" value={payslip.id} />
                        <button type="submit" className="text-gray-300 hover:text-red-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity" title="Remove">✕</button>
                      </form>
                    )}
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-gray-900">{formatIDR(item.amount)}</span>
                </div>
              ))}

              {/* Add Earning Form using pre-defined company components */}
              {!isPaid && (
                <form action={addPayslipItem} className="pt-4 border-t border-gray-100 mt-4 flex gap-2">
                  <input type="hidden" name="payslip_id" value={payslip.id} />
                  <input type="hidden" name="type" value="EARNING" />
                  
                  <select name="name" required className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm bg-white">
                    <option value="">-- Select Earning Component --</option>
                    {availableEarnings.map(comp => (
                      <option key={comp.id} value={comp.name}>{comp.name}</option>
                    ))}
                  </select>

                  <input type="number" name="amount" placeholder="Amount" required min="1" className="w-28 rounded-md border border-gray-300 px-3 py-1.5 text-sm" />
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors">Add</button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DEDUCTIONS */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800">Deductions</h2>
            </div>
            <div className="p-6 space-y-4">
              {deductions.length === 0 && (
                <p className="text-gray-400 text-sm italic">No deductions applied.</p>
              )}
              
              {deductions.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center group">
                  <div className="flex items-center gap-2">
                    {!isPaid && !item.isAuto && (
                      <form action={deletePayslipItem} className="inline">
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="payslip_id" value={payslip.id} />
                        <button type="submit" className="text-gray-300 hover:text-red-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity" title="Remove">✕</button>
                      </form>
                    )}
                    <span className={`text-gray-600 ${item.isAuto ? 'font-medium text-orange-800' : ''}`}>
                      {item.name}
                    </span>
                  </div>
                  <span className="text-red-600 font-medium">- {formatIDR(item.amount)}</span>
                </div>
              ))}

              {/* Add Custom Deduction Form (Allows flexible loan naming & custom amounts) */}
              {!isPaid && (
                <form action={addPayslipItem} className="pt-4 border-t border-gray-100 mt-4 flex gap-2">
                  <input type="hidden" name="payslip_id" value={payslip.id} />
                  <input type="hidden" name="type" value="DEDUCTION" />
                  
                  <input 
                    type="text" 
                    name="name" 
                    placeholder="e.g. Small Loan August26" 
                    required 
                    className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm bg-white"
                  />

                  <input type="number" name="amount" placeholder="Amount" required min="1" className="w-28 rounded-md border border-gray-300 px-3 py-1.5 text-sm" />
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors">Add</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TOTALS FOOTER */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-8 text-sm text-blue-900">
          <div>
            <span className="block text-blue-600/80 mb-1">Gross Earnings</span>
            <span className="font-semibold">{formatIDR(grossEarnings)}</span>
          </div>
          <div>
            <span className="block text-blue-600/80 mb-1">Total Deductions</span>
            <span className="font-semibold text-red-600">- {formatIDR(totalDeductionsAll)}</span>
          </div>
        </div>
        <div className="text-right border-t md:border-t-0 md:border-l border-blue-200 pt-4 md:pt-0 md:pl-8">
          <span className="block text-blue-800 font-medium mb-1">Take Home Pay (Net)</span>
          <span className="text-3xl font-bold text-blue-900">{formatIDR(calculatedNetSalary)}</span>
        </div>
      </div>
    </div>
  )
}
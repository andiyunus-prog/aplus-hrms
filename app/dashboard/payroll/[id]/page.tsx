export const dynamic = 'force-dynamic'

import { createClient } from '../../../../utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { addPayslipItem, deletePayslipItem, markAsPaid, applyOvertime } from './actions'
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
  await requireOwnerPage()

  const supabase = await createClient()
  const { id } = await params

  // 1. Fetch the payslip with relations
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

  // 2. Fetch active loans & their unpaid installments for this employee
  const { data: activeLoans } = await supabase
    .from('employee_loans')
    .select(`
      id, tenor_months, purpose, amount, status,
      employee_loan_installments (*)
    `)
    .eq('employee_id', payslip.employee_id)
    .in('status', ['APPROVED', 'DISBURSED'])

  // 3. Fetch lateness deduction for this specific period
  const { data: latenessRecord } = await supabase
    .from('employee_lateness')
    .select('*')
    .eq('employee_id', payslip.employee_id)
    .eq('period_month', payslip.period_month)
    .eq('period_year', payslip.period_year)
    .single()

  const latenessDeductionAmount = Number(latenessRecord?.deduction_amount || 0)
  const latenessMinutes = Number(latenessRecord?.late_minutes || 0)

  // 4. Fetch company salary components
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

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
  }

  const getMonthName = (monthNumber: number) => {
    return new Date(0, monthNumber - 1).toLocaleString('en-US', { month: 'long' })
  }

  const earnings = payslip.payslip_items?.filter((i: any) => i.type === 'EARNING') || []
  const manualDeductions = payslip.payslip_items?.filter((i: any) => i.type === 'DEDUCTION') || []

  // Combine manual deductions with automated Lateness Penalty
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

  const baseSalaryNum = Number(payslip.base_salary)
  const totalEarningsNum = earnings.reduce((sum: number, item: any) => sum + Number(item.amount), 0)
  const grossEarnings = baseSalaryNum + Number(payslip.total_earnings || totalEarningsNum)

  const manualDeductionsTotal = manualDeductions.reduce((sum: number, item: any) => sum + Number(item.amount), 0)
  const totalDeductionsAll = manualDeductionsTotal + latenessDeductionAmount
  const calculatedNetSalary = grossEarnings - totalDeductionsAll

  // Separate components into EARNING and DEDUCTION lists
  const availableEarnings = companyComponents.filter(c => c.type === 'EARNING')
  const availableDeductions = companyComponents.filter(c => c.type === 'DEDUCTION')
  const isPaid = payslip.status === 'PAID'

  const monthShort = getMonthName(payslip.period_month)
  const yearShort = String(payslip.period_year).slice(-2)

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

              {!isPaid && (
                <div className="space-y-4 pt-4 border-t border-gray-100 mt-4">
                  {/* OVERTIME PRE-INPUT FORM */}
                  <div className="bg-blue-50 p-3.5 rounded-md border border-blue-200 space-y-2.5">
                    <div className="flex justify-between items-center border-b border-blue-200 pb-1.5">
                      <span className="text-xs font-semibold text-blue-900 uppercase tracking-wide">
                        Calculate Overtime
                      </span>
                      <span className="text-[10px] text-blue-700 font-mono">
                        1d = Base/30 | 1h = Daily/8
                      </span>
                    </div>

                    <form action={applyOvertime} className="grid grid-cols-2 gap-2 text-xs">
                      <input type="hidden" name="payslip_id" value={payslip.id} />

                      <div>
                        <label className="block text-gray-600 font-medium mb-1">OT Days</label>
                        <input 
                          type="number" 
                          name="ot_days" 
                          step="0.5" 
                          min="0" 
                          placeholder="e.g. 1 or 2.5" 
                          className="w-full rounded border border-gray-300 p-1.5 bg-white text-sm focus:ring-blue-500" 
                        />
                      </div>

                      <div>
                        <label className="block text-gray-600 font-medium mb-1">OT Hours</label>
                        <input 
                          type="number" 
                          name="ot_hours" 
                          step="0.5" 
                          min="0" 
                          placeholder="e.g. 1 or 3" 
                          className="w-full rounded border border-gray-300 p-1.5 bg-white text-sm focus:ring-blue-500" 
                        />
                      </div>

                      <div className="col-span-2 flex justify-end">
                        <button 
                          type="submit" 
                          className="bg-blue-700 hover:bg-blue-800 text-white font-medium px-3 py-1.5 rounded transition-colors text-xs"
                        >
                          Add Overtime Pay
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* STANDARD EARNING COMPONENT DROPDOWN FORM */}
                  <form action={addPayslipItem} className="flex gap-2">
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
                </div>
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

              {!isPaid && (
                <div className="pt-4 border-t border-gray-100 mt-4 space-y-3">
                  {/* ACTIVE LOANS QUICK-APPLY PANEL */}
                  {activeLoans && activeLoans.length > 0 && (
                    <div className="bg-amber-50 p-3 rounded-md border border-amber-200 space-y-2">
                      <span className="text-xs font-semibold text-amber-900 block uppercase tracking-wide">
                        Apply / Adjust Active Loan Deductions
                      </span>
                      {activeLoans.map((loan: any) => {
                        const unpaidInsts = loan.employee_loan_installments?.filter((i: any) => i.status === 'UNPAID') || []
                        const totalRemaining = unpaidInsts.reduce((sum: number, i: any) => sum + Number(i.amount), 0)
                        
                        if (totalRemaining <= 0) return null

                        const isBigLoan = loan.tenor_months > 1
                        const defaultItemName = isBigLoan 
                          ? `Big Loan ${monthShort}${yearShort}` 
                          : `Small Loan ${monthShort}${yearShort}`

                        const existingDraft = manualDeductions.find((i: any) => i.name === defaultItemName || i.name.toLowerCase().includes('loan'))
                        const currentDraftAmount = existingDraft ? Number(existingDraft.amount) : 0

                        const currentInst = unpaidInsts.find((i: any) => i.period_month === payslip.period_month && i.period_year === payslip.period_year) || unpaidInsts[0]
                        const defaultSuggested = currentInst ? Number(currentInst.amount) : totalRemaining

                        return (
                          <form key={loan.id} action={addPayslipItem} className="flex flex-col gap-1.5 text-xs bg-white p-2.5 rounded border border-amber-100">
                            <input type="hidden" name="payslip_id" value={payslip.id} />
                            <input type="hidden" name="type" value="DEDUCTION" />
                            <input type="hidden" name="name" value={defaultItemName} />
                            
                            <div className="flex justify-between items-center text-gray-700">
                              <span className="font-semibold text-amber-900">
                                {isBigLoan ? 'Big Loan' : 'Small Loan'} ({loan.purpose || 'No Purpose'})
                              </span>
                              <span className="text-gray-500 font-mono">
                                Total Left: {formatIDR(totalRemaining)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-1">
                              <input 
                                type="number" 
                                name="amount" 
                                defaultValue={currentDraftAmount > 0 ? currentDraftAmount : defaultSuggested} 
                                max={totalRemaining}
                                min="1" 
                                required 
                                className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs bg-white" 
                                placeholder="Deduction Amount"
                              />
                              <button type="submit" className="bg-amber-700 hover:bg-amber-800 text-white px-3 py-1 rounded text-xs font-medium transition-colors">
                                {existingDraft ? 'Update Amount' : 'Add Deduction'}
                              </button>
                            </div>
                          </form>
                        )
                      })}
                    </div>
                  )}

                  {/* DEDUCTION COMPONENT DROPDOWN FORM (e.g. BPJS Kesehatan) */}
                  <form action={addPayslipItem} className="flex gap-2">
                    <input type="hidden" name="payslip_id" value={payslip.id} />
                    <input type="hidden" name="type" value="DEDUCTION" />
                    
                    <select name="name" required className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm bg-white">
                      <option value="">-- Select Deduction Component --</option>
                      {availableDeductions.map(comp => (
                        <option key={comp.id} value={comp.name}>{comp.name}</option>
                      ))}
                    </select>

                    <input type="number" name="amount" placeholder="Amount" required min="1" className="w-28 rounded-md border border-gray-300 px-3 py-1.5 text-sm" />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors">Add</button>
                  </form>

                  {/* CUSTOM DEDUCTION TEXT INPUT FORM */}
                  <form action={addPayslipItem} className="flex gap-2">
                    <input type="hidden" name="payslip_id" value={payslip.id} />
                    <input type="hidden" name="type" value="DEDUCTION" />
                    
                    <input 
                      type="text" 
                      name="name" 
                      placeholder="Custom Deduction (e.g. Late fine)" 
                      required 
                      className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm bg-white"
                    />

                    <input type="number" name="amount" placeholder="Amount" required min="1" className="w-28 rounded-md border border-gray-300 px-3 py-1.5 text-sm" />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors">Add</button>
                  </form>
                </div>
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
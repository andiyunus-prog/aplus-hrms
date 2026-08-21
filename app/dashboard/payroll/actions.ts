'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../../../utils/supabase/server'
import { verifyOwnerAction } from '../../../utils/supabase/auth'

const MONTH_NAMES = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function formatLoanLabel(tenor: number, month: number, year: number) {
  const monthName = MONTH_NAMES[month] || 'Month'
  const shortYear = String(year).slice(-2)
  const prefix = tenor > 1 ? 'Big Loan' : 'Small Loan'
  return `${prefix} ${monthName}${shortYear}`
}

async function recalculatePayslipTotals(payslipId: string) {
  if (!(await verifyOwnerAction())) return
  const supabase = await createClient()

  const { data: payslip } = await supabase
    .from('payslips')
    .select('base_salary')
    .eq('id', payslipId)
    .single()

  const { data: items } = await supabase
    .from('payslip_items')
    .select('type, amount')
    .eq('payslip_id', payslipId)

  let total_earnings = 0
  let total_deductions = 0

  items?.forEach(item => {
    if (item.type === 'EARNING') {
      total_earnings += Number(item.amount)
    } else if (item.type === 'DEDUCTION') {
      total_deductions += Number(item.amount)
    }
  })

  const base = Number(payslip?.base_salary || 0)
  const net_salary = (base + total_earnings) - total_deductions

  await supabase
    .from('payslips')
    .update({
      total_earnings,
      total_deductions,
      net_salary
    })
    .eq('id', payslipId)
}

export async function generatePayslip(formData: FormData) {
  if (!(await verifyOwnerAction())) return
  const supabase = await createClient()

  // --- SECURITY CHECK: ONLY OWNER OR ADMIN CAN RUN PAYROLL ACTIONS ---
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase
    .from('profiles')
    .select('roles(code)')
    .eq('id', user.id)
    .single()

  const roleData = profile?.roles as unknown as { code: string } | null
  if (roleData?.code !== 'OWNER' && roleData?.code !== 'ADMIN') {
    console.error('Unauthorized payroll generation attempt')
    return
  }
  // -----------------------------------------------------------------

  const employee_id = formData.get('employee_id') as string
  const period_month = parseInt(formData.get('period_month') as string, 10)
  const period_year = parseInt(formData.get('period_year') as string, 10)

  if (!employee_id || !period_month || !period_year) return

  // 1. Fetch employee base salary
  const { data: salaryRecord } = await supabase
    .from('employee_salaries')
    .select('base_salary')
    .eq('employee_id', employee_id)
    .single()

  const base_salary = Number(salaryRecord?.base_salary || 0)

  // 2. Fetch all loans for this employee using tenor_months
  const { data: rawLoans, error: loanError } = await supabase
    .from('employee_loans')
    .select('id, tenor_months, status')
    .eq('employee_id', employee_id)

  console.log('--- DEBUG: All raw loans for employee ---', rawLoans, loanError)

  // Filter for valid approved/disbursed loans based on your schema check constraints
  const loans = rawLoans?.filter(l => {
    const s = String(l.status || '').trim().toUpperCase()
    return ['APPROVED', 'DISBURSED'].includes(s)
  }) || []

  console.log('--- DEBUG: Filtered active loans ---', loans)

  if (loans.length === 0) {
    await supabase.from('payslips').insert({
      employee_id,
      period_month,
      period_year,
      base_salary,
      total_earnings: 0,
      total_deductions: 0,
      net_salary: base_salary,
      status: 'DRAFT'
    })
    revalidatePath('/dashboard/payroll')
    return
  }

  // Map loan ID to tenor_months correctly
  const loanMap = new Map(loans.map(l => [l.id, Number(l.tenor_months || 1)]))
  const loanIds = loans.map(l => l.id)

  // Fetch all installments for these loans to inspect status and dates
  const { data: installments, error: instError } = await supabase
    .from('employee_loan_installments')
    .select('*')
    .in('loan_id', loanIds)

  console.log('--- DEBUG: All installments in DB for these loans ---', installments, instError)

  let smallLoanTotal = 0
  const bigLoanItems: { id: string; amount: number; label: string }[] = []

  installments?.forEach(inst => {
    // Check if it's unpaid and falls on or before the current target period
    const isUnpaid = inst.status === 'UNPAID' || inst.status === 'PENDING'
    const isPastOrCurrent = 
      inst.period_year < period_year || 
      (inst.period_year === period_year && inst.period_month <= period_month)

    if (isUnpaid && isPastOrCurrent) {
      const tenor = loanMap.get(inst.loan_id) || 1
      const amt = Number(inst.amount)
      const monthName = MONTH_NAMES[inst.period_month] || ''
      const shortYear = String(inst.period_year).slice(-2)

      if (tenor === 1) {
        smallLoanTotal += amt
      } else {
        bigLoanItems.push({
          id: inst.id,
          amount: amt,
          label: `Big Loan ${monthName}${shortYear}`
        })
      }
    }
  })

  const total_deductions = smallLoanTotal + bigLoanItems.reduce((sum, item) => sum + item.amount, 0)
  console.log('--- DEBUG: Calculated total deductions ---', total_deductions)

  // 3. Insert payslip
  const { data: payslip, error: psError } = await supabase
    .from('payslips')
    .insert({
      employee_id,
      period_month,
      period_year,
      base_salary,
      total_earnings: 0,
      total_deductions,
      net_salary: base_salary - total_deductions,
      status: 'DRAFT'
    })
    .select()
    .single()

  if (psError || !payslip) return

  const currentMonthName = MONTH_NAMES[period_month] || ''
  const currentShortYear = String(period_year).slice(-2)

  if (smallLoanTotal > 0) {
    await supabase.from('payslip_items').insert({
      payslip_id: payslip.id,
      name: `Small Loan ${currentMonthName}${currentShortYear}`,
      type: 'DEDUCTION',
      amount: smallLoanTotal
    })
  }

  for (const bigItem of bigLoanItems) {
    await supabase.from('payslip_items').insert({
      payslip_id: payslip.id,
      name: bigItem.label,
      type: 'DEDUCTION',
      amount: bigItem.amount
    })
  }

  await recalculatePayslipTotals(payslip.id)
  revalidatePath('/dashboard/payroll')
  revalidatePath(`/dashboard/employees/${employee_id}/financials`)
}

export async function addPayslipItem(formData: FormData) {
  if (!(await verifyOwnerAction())) return
  const supabase = await createClient()

  // --- SECURITY CHECK ---
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase
    .from('profiles')
    .select('roles(code)')
    .eq('id', user.id)
    .single()

  const roleData = profile?.roles as unknown as { code: string } | null
  if (roleData?.code !== 'OWNER' && roleData?.code !== 'ADMIN') return
  // ----------------------

  const payslip_id = formData.get('payslip_id') as string
  const name = formData.get('name') as string
  const type = formData.get('type') as string
  const amount = parseFloat(formData.get('amount') as string) || 0

  if (!payslip_id || !name || !type || amount <= 0) return

  await supabase.from('payslip_items').insert([{
    payslip_id,
    name,
    type,
    amount
  }])

  await recalculatePayslipTotals(payslip_id)
  revalidatePath(`/dashboard/payroll/${payslip_id}`)
}

export async function deletePayslipItem(formData: FormData) {
  if (!(await verifyOwnerAction())) return
  const supabase = await createClient()

  // --- SECURITY CHECK ---
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase
    .from('profiles')
    .select('roles(code)')
    .eq('id', user.id)
    .single()

  const roleData = profile?.roles as unknown as { code: string } | null
  if (roleData?.code !== 'OWNER' && roleData?.code !== 'ADMIN') return
  // ----------------------

  const id = formData.get('id') as string
  const payslip_id = formData.get('payslip_id') as string

  if (!id || !payslip_id) return

  await supabase.from('payslip_items').delete().eq('id', id)

  await recalculatePayslipTotals(payslip_id)
  revalidatePath(`/dashboard/payroll/${payslip_id}`)
}

export async function deletePayslip(formData: FormData) {
  if (!(await verifyOwnerAction())) return
  const supabase = await createClient()

  // --- SECURITY CHECK ---
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase
    .from('profiles')
    .select('roles(code)')
    .eq('id', user.id)
    .single()

  const roleData = profile?.roles as unknown as { code: string } | null
  if (roleData?.code !== 'OWNER' && roleData?.code !== 'ADMIN') return
  // ----------------------

  const id = formData.get('id') as string

  if (!id) return

  await supabase.from('payslips').delete().eq('id', id)
  revalidatePath('/dashboard/payroll')
}
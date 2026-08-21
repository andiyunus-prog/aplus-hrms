'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../../../../utils/supabase/server'
import { verifyOwnerAction } from '../../../../utils/supabase/auth'

// Helper function to update the main payslip totals dynamically
async function recalculatePayslipTotals(payslip_id: string) {
  // --- SECURITY CHECK ---
  if (!(await verifyOwnerAction())) return
  // ----------------------
  const supabase = await createClient()

  // Fetch base salary
  const { data: payslip } = await supabase.from('payslips').select('base_salary').eq('id', payslip_id).single()
  if (!payslip) return

  // Fetch all items (allowances and deductions)
  const { data: items } = await supabase.from('payslip_items').select('type, amount').eq('payslip_id', payslip_id)

  let total_earnings = 0
  let total_deductions = 0

  if (items) {
    items.forEach((item: { type: string; amount: number }) => {
      if (item.type === 'EARNING') total_earnings += Number(item.amount)
      if (item.type === 'DEDUCTION') total_deductions += Number(item.amount)
    })
  }

  const net_salary = Number(payslip.base_salary) + total_earnings - total_deductions

  // Update payslip record with new totals
  await supabase.from('payslips').update({
    total_earnings,
    total_deductions,
    net_salary
  }).eq('id', payslip_id)
}

export async function addPayslipItem(formData: FormData) {
  // --- SECURITY CHECK ---
  if (!(await verifyOwnerAction())) return
  // ----------------------
  const supabase = await createClient()
  
  const payslip_id = formData.get('payslip_id') as string
  const name = formData.get('name') as string
  const type = formData.get('type') as string
  const amount = parseFloat(formData.get('amount') as string) || 0

  if (!payslip_id || !name || !type || amount <= 0) return

  await supabase.from('payslip_items').insert([{ payslip_id, name, type, amount }])
  await recalculatePayslipTotals(payslip_id)
  
  revalidatePath(`/dashboard/payroll/${payslip_id}`)
}

export async function deletePayslipItem(formData: FormData) {
  // --- SECURITY CHECK ---
  if (!(await verifyOwnerAction())) return
  // ----------------------
  const supabase = await createClient()
  
  const id = formData.get('id') as string
  const payslip_id = formData.get('payslip_id') as string

  if (!id || !payslip_id) return

  await supabase.from('payslip_items').delete().eq('id', id)
  await recalculatePayslipTotals(payslip_id)
  
  revalidatePath(`/dashboard/payroll/${payslip_id}`)
}

export async function markAsPaid(formData: FormData) {
  // --- SECURITY CHECK ---
  if (!(await verifyOwnerAction())) return
  // ----------------------
  const supabase = await createClient()
  const id = formData.get('id') as string

  if (!id) return

  // 1. Fetch payslip
  const { data: payslip } = await supabase
    .from('payslips')
    .select('*')
    .eq('id', id)
    .single()

  if (!payslip || payslip.status === 'PAID') return

  // 2. Fetch and permanently inject the Lateness Deduction (if any)
  const { data: latenessRecord } = await supabase
    .from('employee_lateness')
    .select('*')
    .eq('employee_id', payslip.employee_id)
    .eq('period_month', payslip.period_month)
    .eq('period_year', payslip.period_year)
    .single()

  const latenessDeductionAmount = Number(latenessRecord?.deduction_amount || 0)
  const latenessMinutes = Number(latenessRecord?.late_minutes || 0)

  if (latenessDeductionAmount > 0) {
    // Check if the lateness penalty item is already attached to this payslip
    const { data: existingItems } = await supabase
      .from('payslip_items')
      .select('name')
      .eq('payslip_id', id)

    const hasLatenessItem = existingItems?.some(
      item => item.name.includes('Attendance Lateness Penalty')
    )

    if (!hasLatenessItem) {
      await supabase.from('payslip_items').insert({
        payslip_id: id,
        name: `Attendance Lateness Penalty (${latenessMinutes} mins total, >60m buffer)`,
        amount: latenessDeductionAmount,
        type: 'DEDUCTION'
      })
    }
  }

  // 3. Set payslip status to PAID
  await supabase
    .from('payslips')
    .update({ 
      status: 'PAID', 
      payment_date: new Date().toISOString() 
    })
    .eq('id', id)

  // 4. Get all loan-related deduction items on this payslip
  const { data: deductionItems } = await supabase
    .from('payslip_items')
    .select('name, amount')
    .eq('payslip_id', id)
    .eq('type', 'DEDUCTION')

  const loanDeductions = deductionItems?.filter(item => 
    item.name.toLowerCase().includes('loan') || item.name.toLowerCase().includes('cicilan')
  ) || []

  // Sum up the total loan deduction budget from the payslip
  let totalDeductionBudget = loanDeductions.reduce((sum, item) => sum + Number(item.amount), 0)

  if (totalDeductionBudget > 0) {
    const { data: loans } = await supabase
      .from('employee_loans')
      .select('id')
      .eq('employee_id', payslip.employee_id)
      .in('status', ['APPROVED', 'DISBURSED'])

    const loanIds = loans?.map(l => l.id) || []

    if (loanIds.length > 0) {
      // Fetch all UNPAID installments ordered from oldest to newest
      const { data: installments } = await supabase
        .from('employee_loan_installments')
        .select('id, loan_id, amount, period_month, period_year')
        .in('loan_id', loanIds)
        .eq('status', 'UNPAID')
        .order('period_year', { ascending: true })
        .order('period_month', { ascending: true })

      if (installments && installments.length > 0) {
        for (const inst of installments) {
          if (totalDeductionBudget <= 0) break

          const instAmount = Number(inst.amount)

          if (totalDeductionBudget >= instAmount) {
            // Pay off this installment fully
            await supabase
              .from('employee_loan_installments')
              .update({ status: 'PAID', updated_at: new Date().toISOString() })
              .eq('id', inst.id)

            totalDeductionBudget -= instAmount
          } else {
            // Partial payment: Pay part of this installment and roll over the remainder
            const remainder = instAmount - totalDeductionBudget

            await supabase
              .from('employee_loan_installments')
              .update({ amount: totalDeductionBudget, status: 'PAID', updated_at: new Date().toISOString() })
              .eq('id', inst.id)

            // Roll over remainder to next month
            let nextMonth = payslip.period_month + 1
            let nextYear = payslip.period_year
            if (nextMonth > 12) {
              nextMonth = 1
              nextYear += 1
            }

            await supabase.from('employee_loan_installments').insert({
              loan_id: inst.loan_id,
              amount: remainder,
              period_month: nextMonth,
              period_year: nextYear,
              status: 'UNPAID'
            })

            totalDeductionBudget = 0
          }
        }
      }
    }
  }

  // 5. Final recalculation to lock in lateness + loan totals permanently
  await recalculatePayslipTotals(id)

  revalidatePath('/dashboard/payroll')
  revalidatePath(`/dashboard/payroll/${id}`)
  revalidatePath(`/dashboard/employees/${payslip.employee_id}/financials`)
}
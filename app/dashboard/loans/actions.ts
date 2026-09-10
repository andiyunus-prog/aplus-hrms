'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../../../utils/supabase/server'
import { verifyOwnerAction } from '../../../utils/supabase/auth'

export async function deleteLoan(formData: FormData) {
  if (!(await verifyOwnerAction())) return
  const supabase = await createClient()

  const id = formData.get('id') as string

  if (!id) return

  // 1. Delete associated installments first to maintain database integrity
  const { error: instError } = await supabase
    .from('employee_loan_installments')
    .delete()
    .eq('loan_id', id)

  if (instError) {
    console.error('Error deleting loan installments:', instError.message)
  }

  // 2. Delete the main loan record
  const { error: loanError } = await supabase
    .from('employee_loans')
    .delete()
    .eq('id', id)

  if (loanError) {
    console.error('Error deleting loan record:', loanError.message)
    return
  }

  revalidatePath('/dashboard/loans')
}
export async function requestLoan(formData: FormData) {
  if (!(await verifyOwnerAction())) return
  const supabase = await createClient()

  const employee_id = formData.get('employee_id') as string
  const amount = parseFloat(formData.get('amount') as string) || 0
  const tenor_months = parseInt(formData.get('tenor_months') as string, 10) || 1
  const purpose = formData.get('purpose') as string

  // Custom manual dates/status from Admin (optional fallback)
  const custom_request_date = formData.get('created_at') as string
  const custom_status = (formData.get('status') as string) || 'PENDING'

  if (!employee_id || amount <= 0 || tenor_months <= 0) return

  // Average monthly installment for reference
  const monthly_installment = Math.round((amount / tenor_months) * 100) / 100

  const insertPayload: any = {
    employee_id,
    amount,
    tenor_months,
    monthly_installment,
    purpose,
    status: custom_status,
  }

  if (custom_request_date) {
    insertPayload.created_at = new Date(custom_request_date).toISOString()
  }

  const { data: loan, error } = await supabase
    .from('employee_loans')
    .insert([insertPayload])
    .select()
    .single()

  if (error || !loan) {
    console.error('Error requesting loan:', error?.message)
    return
  }

  // If created directly as APPROVED by Admin, automatically generate installment schedule
  if (custom_status === 'APPROVED') {
    const startDate = custom_request_date ? new Date(custom_request_date) : new Date()
    await generateInstallments(supabase, loan, startDate)
  }

  revalidatePath('/dashboard/loans')
}

export async function updateLoanStatus(formData: FormData) {
  if (!(await verifyOwnerAction())) return
  const supabase = await createClient()
  const id = formData.get('id') as string
  const status = formData.get('status') as string
  const custom_approval_date = formData.get('approval_date') as string

  if (!id || !status) return

  const updatePayload: any = {
    status,
    updated_at: new Date().toISOString()
  }

  if (custom_approval_date && status === 'APPROVED') {
    updatePayload.approved_at = new Date(custom_approval_date).toISOString()
  }

  // 1. Update loan status
  const { data: loan, error } = await supabase
    .from('employee_loans')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single()

  if (error || !loan) {
    console.error('Error updating loan status:', error?.message)
    return
  }

  // 2. If APPROVED, generate installment schedule with clean Rp 1.000 rounding
  if (status === 'APPROVED') {
    const startDate = custom_approval_date 
      ? new Date(custom_approval_date) 
      : loan.created_at ? new Date(loan.created_at) : new Date()

    await generateInstallments(supabase, loan, startDate)
  }

  revalidatePath('/dashboard/loans')
}

// Helper function to generate installments based on a target start date
async function generateInstallments(supabase: any, loan: any, startDate: Date) {
  const { data: existing } = await supabase
    .from('employee_loan_installments')
    .select('id')
    .eq('loan_id', loan.id)

  if (!existing || existing.length === 0) {
    const totalAmount = Number(loan.amount)
    const tenor = Number(loan.tenor_months) || 1

    // Standard rounded monthly installment (rounded DOWN to nearest 1.000)
    const standardInstallment = Math.floor((totalAmount / tenor) / 1000) * 1000

    // Remaining balance for the final month
    const finalInstallment = totalAmount - (standardInstallment * (tenor - 1))

    let targetMonth = startDate.getMonth() + 1
    let targetYear = startDate.getFullYear()

    const installmentsToInsert = []

    for (let i = 0; i < tenor; i++) {
      const isLastMonth = i === tenor - 1
      const installmentAmount = isLastMonth ? finalInstallment : standardInstallment

      installmentsToInsert.push({
        loan_id: loan.id,
        amount: installmentAmount,
        period_month: targetMonth,
        period_year: targetYear,
        status: 'UNPAID'
      })

      targetMonth++
      if (targetMonth > 12) {
        targetMonth = 1
        targetYear++
      }
    }

    await supabase.from('employee_loan_installments').insert(installmentsToInsert)
  }
}
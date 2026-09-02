'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../../../utils/supabase/server'
import { verifyOwnerAction } from '../../../utils/supabase/auth'

export async function requestLoan(formData: FormData) {
  if (!(await verifyOwnerAction())) return
  const supabase = await createClient()

  const employee_id = formData.get('employee_id') as string
  const amount = parseFloat(formData.get('amount') as string) || 0
  const tenor_months = parseInt(formData.get('tenor_months') as string, 10) || 1
  const purpose = formData.get('purpose') as string

  if (!employee_id || amount <= 0 || tenor_months <= 0) return

  // Average monthly installment for reference
  const monthly_installment = Math.round((amount / tenor_months) * 100) / 100

  const { error } = await supabase.from('employee_loans').insert([
    {
      employee_id,
      amount,
      tenor_months,
      monthly_installment,
      purpose,
      status: 'PENDING',
    },
  ])

  if (error) {
    console.error('Error requesting loan:', error.message)
    return
  }

  // THIS WAS MISSING: Tells Next.js to clear cache and reload the loans table list
  revalidatePath('/dashboard/loans')
}

export async function updateLoanStatus(formData: FormData) {
  if (!(await verifyOwnerAction())) return
  const supabase = await createClient()
  const id = formData.get('id') as string
  const status = formData.get('status') as string

  if (!id || !status) return

  // 1. Update loan status
  const { data: loan, error } = await supabase
    .from('employee_loans')
    .update({ 
      status, 
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  // 2. If APPROVED, generate installment schedule with clean Rp 1.000 rounding
  if (status === 'APPROVED' && loan) {
    const { data: existing } = await supabase
      .from('employee_loan_installments')
      .select('id')
      .eq('loan_id', id)

    if (!existing || existing.length === 0) {
      const totalAmount = Number(loan.amount)
      const tenor = Number(loan.tenor_months) || 1

      // 1. Calculate standard rounded monthly installment (rounded DOWN to nearest 1.000)
      const standardInstallment = Math.floor((totalAmount / tenor) / 1000) * 1000

      // 2. Calculate remaining balance for the final month
      const finalInstallment = totalAmount - (standardInstallment * (tenor - 1))

      const currentDate = new Date()
      let targetMonth = currentDate.getMonth() + 1
      let targetYear = currentDate.getFullYear()

      const installmentsToInsert = []

      for (let i = 0; i < tenor; i++) {
        // Last month gets the exact remaining balance (e.g. 334.000)
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

  revalidatePath('/dashboard/loans')
}
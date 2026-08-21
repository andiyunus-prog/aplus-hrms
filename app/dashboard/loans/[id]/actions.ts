'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../../../../utils/supabase/server'
import { verifyOwnerAction } from '../../../../utils/supabase/auth'

export async function updateInstallmentStatus(formData: FormData) {
  // --- SECURITY CHECK ---
  if (!(await verifyOwnerAction())) return
  // ----------------------

  const supabase = await createClient()

  const installment_id = formData.get('installment_id') as string
  const new_status = formData.get('status') as string // 'SKIPPED', 'UNPAID'
  const loan_id = formData.get('loan_id') as string

  if (!installment_id || !new_status || !loan_id) return

  if (new_status === 'SKIPPED') {
    // 1. Fetch all installments for this loan to find the latest month in the schedule
    const { data: installments } = await supabase
      .from('employee_loan_installments')
      .select('period_month, period_year')
      .eq('loan_id', loan_id)
      .order('period_year', { ascending: false })
      .order('period_month', { ascending: false })

    if (installments && installments.length > 0) {
      const latest = installments[0] // The current last month of the loan (e.g., September)
      let nextMonth = latest.period_month + 1
      let nextYear = latest.period_year

      if (nextMonth > 12) {
        nextMonth = 1
        nextYear++
      }

      // 2. Shift the skipped installment's date to the end of the line (October) 
      // and keep it UNPAID so it naturally deducts in October!
      await supabase
        .from('employee_loan_installments')
        .update({ 
          period_month: nextMonth,
          period_year: nextYear,
          status: 'UNPAID', 
          updated_at: new Date().toISOString()
        })
        .eq('id', installment_id)
    }
  } else {
    // Standard status change handler if needed
    await supabase
      .from('employee_loan_installments')
      .update({ 
        status: new_status,
        updated_at: new Date().toISOString()
      })
      .eq('id', installment_id)
  }

  revalidatePath(`/dashboard/loans/${loan_id}`)
}
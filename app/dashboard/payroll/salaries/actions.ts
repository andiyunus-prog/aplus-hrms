'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../../../../utils/supabase/server'

export async function upsertBaseSalary(formData: FormData) {
  const supabase = await createClient()

  const employee_id = formData.get('employee_id') as string
  const base_salary = parseFloat(formData.get('base_salary') as string) || 0

  if (!employee_id) return

  // 1. Check if the employee already has a salary record
  const { data: existing } = await supabase
    .from('employee_salaries')
    .select('id')
    .eq('employee_id', employee_id)
    .single()

  if (existing) {
    // 2. If it exists, UPDATE it
    const { error: updateError } = await supabase
      .from('employee_salaries')
      .update({
        base_salary,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)

    if (updateError) {
      console.error('Error updating salary:', updateError.message)
      return
    }
  } else {
    // 3. If it does not exist, INSERT a new one
    const { error: insertError } = await supabase
      .from('employee_salaries')
      .insert([
        {
          employee_id,
          base_salary,
        },
      ])

    if (insertError) {
      console.error('Error inserting salary:', insertError.message)
      return
    }
  }

  // Refresh the page data
  revalidatePath('/dashboard/payroll/salaries')
}
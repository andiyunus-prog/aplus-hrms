'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../../../../utils/supabase/server'
import { getCurrentUserRole } from '../../../../utils/supabase/auth'

export async function saveLatenessRecords(formData: FormData) {
  const userRole = await getCurrentUserRole()
  if (userRole !== 'OWNER' && userRole !== 'ADMIN' && userRole !== 'HRD') {
    return
  }

  const supabase = await createClient()

  const period_month = parseInt(formData.get('period_month') as string, 10)
  const period_year = parseInt(formData.get('period_year') as string, 10)

  if (!period_month || !period_year) return

  const entries: { employee_id: string; late_minutes: number }[] = []

  for (const [key, value] of formData.entries()) {
    if (key.startsWith('late_minutes_')) {
      const employee_id = key.replace('late_minutes_', '')
      const late_minutes = parseInt(value as string, 10) || 0
      entries.push({ employee_id, late_minutes })
    }
  }

  for (const entry of entries) {
    const excessMinutes = Math.max(0, entry.late_minutes - 60)
    const deduction_amount = excessMinutes * 1000

    await supabase
      .from('employee_lateness')
      .upsert({
        employee_id: entry.employee_id,
        period_month,
        period_year,
        late_minutes: entry.late_minutes,
        deduction_amount,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'employee_id,period_month,period_year'
      })
  }

  revalidatePath(`/dashboard/attendance/lateness`)
}
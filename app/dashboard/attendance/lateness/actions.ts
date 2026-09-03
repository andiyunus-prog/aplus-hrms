'use server'

'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '../../../../utils/supabase/admin'
import { verifyOwnerAction } from '../../../../utils/supabase/auth'

// --- ABSENCE ACTIONS ---
export async function addEmployeeAbsence(formData: FormData) {
  if (!(await verifyOwnerAction())) return
  const supabase = createAdminClient()

  const employee_id = formData.get('employee_id') as string
  const absence_date = formData.get('absence_date') as string // 'YYYY-MM-DD'
  const reason = (formData.get('reason') as string) || 'Unexcused Absence'

  if (!employee_id || !absence_date) return

  const { error } = await supabase
    .from('employee_absences')
    .upsert(
      { employee_id, absence_date, reason },
      { onConflict: 'employee_id,absence_date' }
    )

  if (error) {
    console.error('Error logging absence:', error.message)
    return
  }

  revalidatePath('/dashboard/attendance/lateness')
}

export async function deleteEmployeeAbsence(formData: FormData) {
  if (!(await verifyOwnerAction())) return
  const supabase = createAdminClient()

  const id = formData.get('id') as string
  if (!id) return

  const { error } = await supabase.from('employee_absences').delete().eq('id', id)

  if (error) {
    console.error('Error deleting absence record:', error.message)
    return
  }

  revalidatePath('/dashboard/attendance/lateness')
}
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
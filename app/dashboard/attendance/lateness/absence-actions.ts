'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '../../../../utils/supabase/admin'
import { verifyOwnerAction } from '../../../../utils/supabase/auth'

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

  const { error } = await supabase
    .from('employee_absences')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting absence record:', error.message)
    return
  }

  revalidatePath('/dashboard/attendance/lateness')
}
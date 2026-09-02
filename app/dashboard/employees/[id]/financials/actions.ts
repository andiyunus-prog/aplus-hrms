'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../../../../../utils/supabase/server'
import { verifyOwnerAction } from '../../../../../utils/supabase/auth'

export async function addDefaultComponent(formData: FormData) {
  if (!(await verifyOwnerAction())) return
  const supabase = await createClient()

  const employee_id = formData.get('employee_id') as string
  const component_id = formData.get('component_id') as string
  const default_amount = parseFloat(formData.get('default_amount') as string) || 0

  if (!employee_id || !component_id || default_amount <= 0) return

  // Upsert: Add new or update amount if preset already exists
  const { error } = await supabase
    .from('employee_default_components')
    .upsert(
      {
        employee_id,
        component_id,
        default_amount,
      },
      { onConflict: 'employee_id,component_id' }
    )

  if (error) {
    console.error('Error adding default component:', error.message)
    return
  }

  revalidatePath(`/dashboard/employees/${employee_id}/financials`)
}

export async function deleteDefaultComponent(formData: FormData) {
  if (!(await verifyOwnerAction())) return
  const supabase = await createClient()

  const id = formData.get('id') as string
  const employee_id = formData.get('employee_id') as string

  if (!id || !employee_id) return

  const { error } = await supabase
    .from('employee_default_components')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting default component:', error.message)
    return
  }

  revalidatePath(`/dashboard/employees/${employee_id}/financials`)
}
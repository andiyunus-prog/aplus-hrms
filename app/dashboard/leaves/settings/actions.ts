'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../../../../utils/supabase/server'

export async function createLeaveType(formData: FormData) {
  const supabase = await createClient()

  const company_id = formData.get('company_id') as string
  const name = formData.get('name') as string
  const code = (formData.get('code') as string)?.trim().toUpperCase()
  const description = (formData.get('description') as string) || null
  const days_allowed = parseInt(formData.get('days_allowed') as string, 10) || 0

  if (!company_id || !name || !code) return

  const { error } = await supabase.from('leave_types').insert([
    {
      company_id,
      name,
      code,
      description,
      days_allowed,
      is_active: true,
    },
  ])

  if (error) {
    console.error('Error creating leave type:', error.message)
    return
  }

  revalidatePath('/dashboard/leaves/settings')
  revalidatePath('/dashboard/leaves')
}

export async function deleteLeaveType(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  if (!id) return

  const { error } = await supabase.from('leave_types').delete().eq('id', id)

  if (error) {
    console.error('Error deleting leave type:', error.message)
    return
  }

  revalidatePath('/dashboard/leaves/settings')
  revalidatePath('/dashboard/leaves')
}
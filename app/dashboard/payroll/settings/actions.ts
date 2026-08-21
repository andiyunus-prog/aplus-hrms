'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../../../../utils/supabase/server'

export async function createSalaryComponent(formData: FormData) {
  const supabase = await createClient()

  const company_id = formData.get('company_id') as string
  const name = formData.get('name') as string
  const type = formData.get('type') as string
  const is_default = formData.get('is_default') === 'on' // Checkbox returns 'on' if checked

  if (!company_id || !name || !type) return

  const { error } = await supabase.from('salary_components').insert([
    {
      company_id,
      name,
      type,
      is_default,
    },
  ])

  if (error) {
    console.error('Error creating salary component:', error.message)
    return
  }

  revalidatePath('/dashboard/payroll/settings')
}

export async function deleteSalaryComponent(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  if (!id) return

  const { error } = await supabase.from('salary_components').delete().eq('id', id)

  if (error) {
    console.error('Error deleting salary component:', error.message)
    return
  }

  revalidatePath('/dashboard/payroll/settings')
}
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../../../utils/supabase/server'

export async function createCompany(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const code = formData.get('code') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string

  if (!name) return

  // Provide both 'name' and 'legal_name' to satisfy the database schema constraints
  const { error } = await supabase.from('companies').insert([
    { name, legal_name: name, code, email, phone, address }
  ])

  if (error) {
    console.error('Error creating company:', error.message)
    return
  }

  revalidatePath('/dashboard/companies')
}

export async function updateCompany(formData: FormData) {
  const supabase = await createClient()

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const code = formData.get('code') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string

  if (!id || !name) return

  // Update both 'name' and 'legal_name'
  const { error } = await supabase
    .from('companies')
    .update({ name, legal_name: name, code, email, phone, address })
    .eq('id', id)

  if (error) {
    console.error('Error updating company:', error.message)
    return
  }

  revalidatePath('/dashboard/companies')
}

export async function deleteCompany(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  if (!id) return

  const { error } = await supabase.from('companies').delete().eq('id', id)

  if (error) {
    console.error('Error deleting company:', error.message)
    return
  }

  revalidatePath('/dashboard/companies')
}
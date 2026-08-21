'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../../../utils/supabase/server'

export async function createEmployee(formData: FormData) {
  const supabase = await createClient()

  const company_id = formData.get('company_id') as string
  const employee_code = formData.get('employee_code') as string
  const full_name = formData.get('full_name') as string
  const nik = formData.get('nik') as string
  const gender = formData.get('gender') as string
  const religion = formData.get('religion') as string
  const birth_date = formData.get('birth_date') as string
  const hire_date = formData.get('hire_date') as string
  const employment_status = formData.get('employment_status') as string
  const marital_status = formData.get('marital_status') as string

  // Optional fields
  const email = (formData.get('email') as string) || null
  const phone = (formData.get('phone') as string) || null
  const department = (formData.get('department') as string) || null
  const job_position = (formData.get('job_position') as string) || null // <-- Added job_position
  const nickname = (formData.get('nickname') as string) || null
  const npwp = (formData.get('npwp') as string) || null
  const birth_place = (formData.get('birth_place') as string) || null
  const address = (formData.get('address') as string) || null
  const emergency_contact_name = (formData.get('emergency_contact_name') as string) || null
  const emergency_contact_phone = (formData.get('emergency_contact_phone') as string) || null
  const bank_account = (formData.get('bank_account') as string) || null
  const bank_account_name = (formData.get('bank_account_name') as string) || null
  const notes = (formData.get('notes') as string) || null
  const status = (formData.get('status') as string) || 'ACTIVE'

  if (!company_id || !employee_code || !full_name || !nik || !gender || !religion || !birth_date || !hire_date || !employment_status || !marital_status) {
    console.error('Missing required employee fields')
    return
  }

  const { error } = await supabase.from('employees').insert([{
    company_id, employee_code, full_name, nik, gender, religion, birth_date,
    hire_date, employment_status, marital_status, email, phone, department,
    job_position, // <-- Added job_position here
    nickname, npwp, birth_place, address, emergency_contact_name, 
    emergency_contact_phone, bank_account, bank_account_name, notes, status
  }])

  if (error) {
    console.error('Error creating employee:', error.message)
    return
  }

  revalidatePath('/dashboard/employees')
}

export async function updateEmployee(formData: FormData) {
  const supabase = await createClient()

  const id = formData.get('id') as string
  const company_id = formData.get('company_id') as string
  const employee_code = formData.get('employee_code') as string
  const full_name = formData.get('full_name') as string
  const nik = formData.get('nik') as string
  const gender = formData.get('gender') as string
  const religion = formData.get('religion') as string
  const birth_date = formData.get('birth_date') as string
  const hire_date = formData.get('hire_date') as string
  const employment_status = formData.get('employment_status') as string
  const marital_status = formData.get('marital_status') as string

  // Optional fields
  const email = (formData.get('email') as string) || null
  const phone = (formData.get('phone') as string) || null
  const department = (formData.get('department') as string) || null
  const job_position = (formData.get('job_position') as string) || null // <-- Added job_position
  const nickname = (formData.get('nickname') as string) || null
  const npwp = (formData.get('npwp') as string) || null
  const birth_place = (formData.get('birth_place') as string) || null
  const address = (formData.get('address') as string) || null
  const emergency_contact_name = (formData.get('emergency_contact_name') as string) || null
  const emergency_contact_phone = (formData.get('emergency_contact_phone') as string) || null
  const bank_account = (formData.get('bank_account') as string) || null
  const bank_account_name = (formData.get('bank_account_name') as string) || null
  const notes = (formData.get('notes') as string) || null
  const status = (formData.get('status') as string) || 'ACTIVE'
  
  const resign_date_raw = formData.get('resign_date') as string
  const resign_date = resign_date_raw ? resign_date_raw : null

  if (!id || !company_id || !employee_code || !full_name) return

  const { error } = await supabase.from('employees').update({
    company_id, employee_code, full_name, nik, gender, religion, birth_date,
    hire_date, employment_status, marital_status, email, phone, department,
    job_position, // <-- Added job_position here
    nickname, npwp, birth_place, address, emergency_contact_name, 
    emergency_contact_phone, bank_account, bank_account_name, notes, status,
    resign_date, updated_at: new Date().toISOString(),
  }).eq('id', id)

  if (error) {
    console.error('Error updating employee:', error.message)
    return
  }

  revalidatePath('/dashboard/employees')
}

export async function deleteEmployee(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  if (!id) return
  const { error } = await supabase.from('employees').delete().eq('id', id)
  if (error) console.error('Error deleting employee:', error.message)

  revalidatePath('/dashboard/employees')
}
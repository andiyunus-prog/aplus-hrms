'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '../../../utils/supabase/admin'

export async function createEmployee(formData: FormData) {
  const adminSupabase = createAdminClient()

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

  const username = (formData.get('username') as string)?.trim().toLowerCase()

  const email = (formData.get('email') as string) || null
  const phone = (formData.get('phone') as string) || null
  const department = (formData.get('department') as string) || null
  const job_position = (formData.get('job_position') as string) || null
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

  let auth_user_id = null

  if (username) {
    const authEmail = `${username}@aplusgroup.my.id`
    const defaultPassword = username

    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email: authEmail,
      password: defaultPassword,
      email_confirm: true,
    })

    if (authError) {
      console.error('Error creating auth user account:', authError.message)
    } else if (authData.user) {
      auth_user_id = authData.user.id
    }
  }

  const { error } = await adminSupabase.from('employees').insert([{
    company_id, employee_code, full_name, nik, gender, religion, birth_date,
    hire_date, employment_status, marital_status, email, phone, department,
    job_position, nickname, npwp, birth_place, address, emergency_contact_name, 
    emergency_contact_phone, bank_account, bank_account_name, notes, status,
    auth_user_id
  }])

  if (error) {
    console.error('Error creating employee:', error.message)
    return
  }

  revalidatePath('/dashboard/employees')
  revalidatePath('/dashboard/employees/resigned')
}

export async function updateEmployee(formData: FormData) {
  const adminSupabase = createAdminClient()

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

  const username = (formData.get('username') as string)?.trim().toLowerCase()

  const email = (formData.get('email') as string) || null
  const phone = (formData.get('phone') as string) || null
  const department = (formData.get('department') as string) || null
  const job_position = (formData.get('job_position') as string) || null
  const nickname = (formData.get('nickname') as string) || null
  const npwp = (formData.get('npwp') as string) || null
  const birth_place = (formData.get('birth_place') as string) || null
  const address = (formData.get('address') as string) || null
  const emergency_contact_name = (formData.get('emergency_contact_name') as string) || null
  const emergency_contact_phone = (formData.get('emergency_contact_phone') as string) || null
  const bank_account = (formData.get('bank_account') as string) || null
  const bank_account_name = (formData.get('bank_account_name') as string) || null
  const notes = (formData.get('notes') as string) || null
  
  const resign_date_raw = formData.get('resign_date') as string
  const resign_date = resign_date_raw ? resign_date_raw : null

  // Automatically force 'RESIGNED' if a resignation date is present
  let status = (formData.get('status') as string) || 'ACTIVE'
  if (resign_date) {
    status = 'RESIGNED'
  }

  if (!id || !company_id || !employee_code || !full_name) return

  const updateData: any = {
    company_id, employee_code, full_name, nik, gender, religion, birth_date,
    hire_date, employment_status, marital_status, email, phone, department,
    job_position, nickname, npwp, birth_place, address, emergency_contact_name, 
    emergency_contact_phone, bank_account, bank_account_name, notes, status,
    resign_date, updated_at: new Date().toISOString(),
  }

  if (username) {
    const authEmail = `${username}@aplusgroup.my.id`
    const defaultPassword = username

    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email: authEmail,
      password: defaultPassword,
      email_confirm: true,
    })

    if (authError) {
      console.error('Error creating auth user account during update:', authError.message)
    } else if (authData.user) {
      updateData.auth_user_id = authData.user.id
    }
  }

  const { error } = await adminSupabase.from('employees').update(updateData).eq('id', id)

  if (error) {
    console.error('Error updating employee:', error.message)
    return
  }

  revalidatePath('/dashboard/employees')
  revalidatePath('/dashboard/employees/resigned')
}

export async function markEmployeeResigned(formData: FormData) {
  const adminSupabase = createAdminClient()

  const employee_id = formData.get('employee_id') as string
  const resign_date = (formData.get('resign_date') as string) || new Date().toISOString().split('T')[0]
  const notes = (formData.get('notes') as string) || 'Resigned'

  if (!employee_id) return

  const { error } = await adminSupabase
    .from('employees')
    .update({
      status: 'RESIGNED',
      resign_date,
      notes,
      updated_at: new Date().toISOString()
    })
    .eq('id', employee_id)

  if (error) {
    console.error('Error marking employee as resigned:', error.message)
    return
  }

  revalidatePath('/dashboard/employees')
  revalidatePath('/dashboard/employees/resigned')
}

export async function rehireEmployee(formData: FormData) {
  const adminSupabase = createAdminClient()

  const employee_id = formData.get('employee_id') as string
  const new_hire_date = (formData.get('hire_date') as string) || new Date().toISOString().split('T')[0]

  if (!employee_id) return

  const { error } = await adminSupabase
    .from('employees')
    .update({
      status: 'ACTIVE',
      hire_date: new_hire_date,
      resign_date: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', employee_id)

  if (error) {
    console.error('Error rehiring employee:', error.message)
    return
  }

  revalidatePath('/dashboard/employees')
  revalidatePath('/dashboard/employees/resigned')
}

export async function deleteEmployee(formData: FormData) {
  const adminSupabase = createAdminClient()
  const id = formData.get('id') as string

  if (!id) return

  const { data: employee, error: fetchError } = await adminSupabase
    .from('employees')
    .select('auth_user_id')
    .eq('id', id)
    .single()

  if (fetchError) {
    console.error('Error fetching employee for deletion:', fetchError.message)
    return
  }

  if (employee?.auth_user_id) {
    const { error: authDeleteError } = await adminSupabase.auth.admin.deleteUser(
      employee.auth_user_id
    )

    if (authDeleteError) {
      console.error('Error deleting auth user:', authDeleteError.message)
    }
  }

  const { error: dbDeleteError } = await adminSupabase
    .from('employees')
    .delete()
    .eq('id', id)

  if (dbDeleteError) {
    console.error('Error deleting employee row:', dbDeleteError.message)
    return
  }

  revalidatePath('/dashboard/employees')
  revalidatePath('/dashboard/employees/resigned')
}
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../../../utils/supabase/server'
import { createAdminClient } from '../../../utils/supabase/admin'

// 1. SUBMIT LEAVE REQUEST
export async function submitLeaveRequest(formData: FormData) {
  const supabase = await createClient()
  const adminSupabase = createAdminClient()

  // Authenticate User
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Fetch Employee Record
  const { data: employee } = await adminSupabase
    .from('employees')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!employee) return

  const leave_type_id = formData.get('leave_type_id') as string
  const start_date = formData.get('start_date') as string
  const end_date = formData.get('end_date') as string
  const reason = formData.get('reason') as string

  if (!leave_type_id || !start_date || !end_date) return

  // Calculate total days automatically
  const start = new Date(start_date)
  const end = new Date(end_date)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const total_days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

  const { error } = await adminSupabase.from('leave_requests').insert([{
    employee_id: employee.id,
    leave_type_id,
    start_date,
    end_date,
    total_days,
    reason,
    status: 'PENDING'
  }])

  if (error) {
    console.error('--- LEAVE REQUEST INSERT ERROR ---', error.message)
    return
  }

  revalidatePath('/dashboard/my-profile')
}

// 2. SUBMIT LOAN REQUEST
export async function submitLoanRequest(formData: FormData) {
  const supabase = await createClient()
  const adminSupabase = createAdminClient()

  // Authenticate User
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Fetch Employee Record
  const { data: employee } = await adminSupabase
    .from('employees')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!employee) return

  const amount = parseFloat(formData.get('amount') as string) || 0
  const tenor_months = parseInt(formData.get('tenor_months') as string, 10) || 1
  const purpose = formData.get('purpose') as string

  if (amount <= 0 || tenor_months <= 0) return

  const monthly_installment = Math.round(amount / tenor_months)

  const { error } = await adminSupabase.from('employee_loans').insert([{
    employee_id: employee.id,
    request_date: new Date().toISOString().split('T')[0],
    amount,
    tenor_months,
    monthly_installment,
    purpose,
    status: 'PENDING'
  }])

  if (error) {
    console.error('--- LOAN REQUEST INSERT ERROR ---', error.message)
    return
  }

  revalidatePath('/dashboard/my-profile')
}
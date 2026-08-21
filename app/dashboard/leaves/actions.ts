'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../../../utils/supabase/server'

export async function createLeaveRequest(formData: FormData) {
  const supabase = await createClient()

  const employee_id = formData.get('employee_id') as string
  const leave_type_id = formData.get('leave_type_id') as string
  const start_date = formData.get('start_date') as string
  const end_date = formData.get('end_date') as string
  const total_days = parseInt(formData.get('total_days') as string, 10)
  const reason = formData.get('reason') as string

  if (!employee_id || !leave_type_id || !start_date || !end_date || isNaN(total_days)) {
    return
  }

  const { error } = await supabase.from('leave_requests').insert([{
    employee_id,
    leave_type_id,
    start_date,
    end_date,
    total_days,
    reason,
    status: 'PENDING'
  }])

  if (error) {
    console.error('Error creating leave request:', error.message)
    return
  }

  revalidatePath('/dashboard/leaves')
}

export async function updateLeaveStatus(formData: FormData) {
  const supabase = await createClient()
  
  const id = formData.get('id') as string
  const status = formData.get('status') as string

  if (!id || !status) return

  const { error } = await supabase
    .from('leave_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Error updating leave status:', error.message)
    return
  }

  revalidatePath('/dashboard/leaves')
}

export async function deleteLeaveRequest(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  if (!id) return

  const { error } = await supabase.from('leave_requests').delete().eq('id', id)
  
  if (error) {
    console.error('Error deleting leave request:', error.message)
    return
  }

  revalidatePath('/dashboard/leaves')
}
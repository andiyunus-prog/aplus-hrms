'use server'

import { redirect } from 'next/navigation'
import { createClient } from '../../utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  let emailOrUsername = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string

  if (emailOrUsername && !emailOrUsername.includes('@')) {
    emailOrUsername = `${emailOrUsername}@aplusgroup.my.id`
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailOrUsername,
    password,
  })

  if (error) {
    console.log('--- SUPABASE AUTH ERROR ---')
    console.log('Message:', error.message)
    console.log('---------------------------')
    redirect(`/login?message=${encodeURIComponent(error.message)}`)
  }

  const userId = data.user?.id

  // Check the user's role from the profiles and roles tables
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      roles (code)
    `)
    .eq('id', userId)
    .single()

  // Safely extract the role code without strict casting errors
  const rawRoles: any = profile?.roles
  const roleCode = (
    Array.isArray(rawRoles) 
      ? rawRoles[0]?.code 
      : rawRoles?.code
  )?.toUpperCase() || ''

  const isAdminOrOwner = ['ADMIN', 'OWNER', 'HRD', 'HR', 'HR_ADMIN'].includes(roleCode)

  // Smart Redirection based on role
  if (isAdminOrOwner) {
    redirect('/dashboard') // Admins/Owners go straight to Overview
  } else {
    redirect('/dashboard/my-profile') // Regular employees go to their ESS profile
  }
}
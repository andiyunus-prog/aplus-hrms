import { createClient } from './server'
import { redirect } from 'next/navigation'

export async function getCurrentUserRole() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch profile and role code
  const { data: profile } = await supabase
    .from('profiles')
    .select('roles(code)')
    .eq('id', user.id)
    .single()

  // Safely extract the role code
  const roleData = profile?.roles as unknown as { code: string } | null
  return roleData?.code || null
}

export async function requireOwner() {
  const role = await getCurrentUserRole()
  if (role !== 'OWNER' && role !== 'ADMIN') {
    throw new Error('Unauthorized: Only Owners/Admins can access this section.')
  }
}

/**
 * Use this at the top of protected Page components to redirect unauthorized users.
 */
export async function requireOwnerPage() {
  const role = await getCurrentUserRole()
  if (role !== 'OWNER' && role !== 'ADMIN') {
    redirect('/dashboard')
  }
}

/**
 * Use this at the top of protected Server Actions to block unauthorized requests.
 */
export async function verifyOwnerAction() {
  const role = await getCurrentUserRole()
  return role === 'OWNER' || role === 'ADMIN'
}

/**
 * NEW: Get the employee record ID linked to the currently logged-in auth user.
 * Essential for Employee Self-Service (ESS) pages.
 */
export async function getCurrentEmployeeId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: employee } = await supabase
    .from('employees')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  return employee?.id || null
}
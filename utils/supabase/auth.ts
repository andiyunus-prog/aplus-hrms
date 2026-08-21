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
 * NEW: Use this at the top of protected Page components to redirect HRD users.
 */
export async function requireOwnerPage() {
  const role = await getCurrentUserRole()
  if (role !== 'OWNER' && role !== 'ADMIN') {
    redirect('/dashboard')
  }
}

/**
 * NEW: Use this at the top of protected Server Actions to block HRD requests.
 */
export async function verifyOwnerAction() {
  const role = await getCurrentUserRole()
  return role === 'OWNER' || role === 'ADMIN'
}
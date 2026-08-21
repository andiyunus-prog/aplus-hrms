import { NextResponse } from 'next/server'
import { createClient } from '../../../utils/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  // Sign out on Supabase side
  await supabase.auth.signOut()

  // Redirect back to login
  return NextResponse.redirect(new URL('/login', request.url), {
    status: 302,
  })
}
'use server'

import { redirect } from 'next/navigation'
import { createClient } from '../../utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // Get the input value (can be a short username like 'andi' or a full email)
  let emailOrUsername = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string

  // If the user did not type an '@', automatically append your system domain
  if (emailOrUsername && !emailOrUsername.includes('@')) {
    emailOrUsername = `${emailOrUsername}@aplusgroup.my.id`
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailOrUsername,
    password,
  })

  if (error) {
    // Print the EXACT error from Supabase to your terminal running `npm run dev`
    console.log('--- SUPABASE AUTH ERROR ---')
    console.log('Status:', error.status)
    console.log('Message:', error.message)
    console.log('---------------------------')

    // Redirect with the REAL error message so you can see it on the page
    redirect(`/login?message=${encodeURIComponent(error.message)}`)
  }

  // On success, redirect to dashboard
  redirect('/dashboard')
}
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and supabase.auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()

  // 1. If user is NOT logged in and trying to access /dashboard, redirect to /login
  if (!user && url.pathname.startsWith('/dashboard')) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 2. If user is NOT logged in and hits the root page /, send them to /login
  if (!user && url.pathname === '/') {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 3. Authenticated user logic
  if (user) {
    // Fetch user's role from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('roles(code)')
      .eq('id', user.id)
      .single()

    const rawRoles: any = profile?.roles
    const roleCode = (
      Array.isArray(rawRoles) ? rawRoles[0]?.code : rawRoles?.code
    )?.toUpperCase() || ''

    const isAdmin = ['OWNER', 'ADMIN', 'HRD', 'HR', 'HR_ADMIN'].includes(roleCode)
    const isProfilePage = url.pathname.startsWith('/dashboard/my-profile')

    // Redirect logged-in user hitting / or /login to their designated portal
    if (url.pathname === '/' || url.pathname === '/login') {
      url.pathname = isAdmin ? '/dashboard' : '/dashboard/my-profile'
      return NextResponse.redirect(url)
    }

    // REGULAR EMPLOYEE GUARD: Force non-admins to /dashboard/my-profile if accessing any admin route
    if (!isAdmin && url.pathname.startsWith('/dashboard') && !isProfilePage) {
      url.pathname = '/dashboard/my-profile'
      return NextResponse.redirect(url)
    }

    // ADMIN GUARD: Keep admins on main dashboard if they try to visit /dashboard/my-profile
    if (isAdmin && isProfilePage) {
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
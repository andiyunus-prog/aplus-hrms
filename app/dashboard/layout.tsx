import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '../../utils/supabase/server'
import { getCurrentUserRole } from '../../utils/supabase/auth'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const userRole = await getCurrentUserRole()
  const isOwnerOrAdmin = userRole === 'OWNER' || userRole === 'ADMIN'
  const canAccessAttendance = isOwnerOrAdmin || userRole === 'HRD'

  async function signOut() {
    'use server'
    const supabaseServer = await createClient()
    await supabaseServer.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="text-xl font-bold text-blue-700">A+ HRMS</span>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1">
          <Link 
            href="/dashboard" 
            className="block px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-blue-600 transition-colors"
          >
            Overview
          </Link>
          <Link 
            href="/dashboard/companies" 
            className="block px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-blue-600 transition-colors"
          >
            Companies
          </Link>
          <Link 
            href="/dashboard/employees" 
            className="block px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-blue-600 transition-colors"
          >
            Employees
          </Link>
          <Link 
            href="/dashboard/leaves" 
            className="block px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-blue-600 transition-colors"
          >
            Leave Requests
          </Link>

          {/* DISPLAYED FOR OWNER, ADMIN, AND HRD */}
          {canAccessAttendance && (
            <Link 
              href="/dashboard/attendance/lateness" 
              className="block px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-blue-600 transition-colors"
            >
              Attendance Lateness
            </Link>
          )}

          {/* DISPLAYED ONLY FOR OWNER / ADMIN */}
          {isOwnerOrAdmin && (
            <>
              <Link 
                href="/dashboard/payroll" 
                className="block px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-blue-600 transition-colors"
              >
                Payroll & Payslips
              </Link>
              <Link 
                href="/dashboard/loans" 
                className="block px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-blue-600 transition-colors"
              >
                Employee Loans
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-200 bg-gray-50/50">
          <div className="text-xs text-gray-500 mb-3 truncate px-2 font-medium">
            Signed in as: <br/> 
            <span className="text-gray-900">{user.email}</span>
          </div>
          <form action={signOut}>
            <button 
              type="submit" 
              className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
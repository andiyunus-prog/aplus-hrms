import { createClient } from '../../../utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function MyProfilePage() {
  const supabase = await createClient()

  // 1. Ensure user is authenticated
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect('/login')
  }

  // 2. Fetch user role from profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      roles (code)
    `)
    .eq('id', user.id)
    .single()

  const rawRoles: any = profile?.roles
  const roleCode = (
    Array.isArray(rawRoles) 
      ? rawRoles[0]?.code 
      : rawRoles?.code
  )?.toUpperCase() || ''

  const isAdminOrOwner = ['ADMIN', 'OWNER', 'HRD', 'HR', 'HR_ADMIN'].includes(roleCode)

  // 3. STRICT SECURITY: If the logged-in user is an Admin/Owner/HR, block & redirect them to /dashboard immediately
  if (isAdminOrOwner) {
    redirect('/dashboard')
  }

  // 4. For Regular Employees: Fetch their employee record securely using auth_user_id
  const { data: employee, error } = await supabase
    .from('employees')
    .select(`
      *,
      companies (name, legal_name, address),
      banks (name, code)
    `)
    .eq('auth_user_id', user.id)
    .single()

  if (error || !employee) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <h1 className="text-xl font-bold text-red-600">Profile Not Linked</h1>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Your account (<span className="font-mono text-gray-700">{user.email}</span>) is not linked to an employee record yet. Please contact HR.
        </p>
      </div>
    )
  }

  // 5. Fetch ESS records exclusively for regular employees
  const { data: compensation } = await supabase
    .from('employee_compensation')
    .select('*')
    .eq('employee_id', employee.id)
    .order('effective_from', { ascending: false })
    .limit(1)
    .single()

  const { data: payslips } = await supabase
    .from('payslips')
    .select('*')
    .eq('employee_id', employee.id)
    .order('period_year', { ascending: false })
    .order('period_month', { ascending: false })

  const { data: loans } = await supabase
    .from('employee_loans')
    .select('*')
    .eq('employee_id', employee.id)
    .order('created_at', { ascending: false })

  const { data: attendances } = await supabase
    .from('attendances')
    .select('*')
    .eq('employee_id', employee.id)
    .order('attendance_date', { ascending: false })
    .limit(15)

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Employee Header Profile */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{employee.full_name}</h1>
          <p className="text-gray-500 text-sm mt-0.5">Code: {employee.employee_code} | Department: {employee.department || '-'}</p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {employee.employment_status}
        </span>
      </div>

      {/* Profile Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <h3 className="text-md font-semibold text-gray-800 border-b pb-2">Personal Information</h3>
          <div className="text-sm space-y-2">
            <div><span className="text-gray-500 font-medium">NIK:</span> {employee.nik}</div>
            <div><span className="text-gray-500 font-medium">Gender:</span> {employee.gender}</div>
            <div><span className="text-gray-500 font-medium">Religion:</span> {employee.religion}</div>
            <div><span className="text-gray-500 font-medium">Birth Place/Date:</span> {employee.birth_place || '-'}, {employee.birth_date}</div>
            <div><span className="text-gray-500 font-medium">Marital Status:</span> {employee.marital_status}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <h3 className="text-md font-semibold text-gray-800 border-b pb-2">Employment Details</h3>
          <div className="text-sm space-y-2">
            <div><span className="text-gray-500 font-medium">Company:</span> {employee.companies?.legal_name || employee.companies?.name || '-'}</div>
            <div><span className="text-gray-500 font-medium">Job Position:</span> {employee.job_position || '-'}</div>
            <div><span className="text-gray-500 font-medium">Hire Date:</span> {employee.hire_date}</div>
            <div><span className="text-gray-500 font-medium">Email:</span> {employee.email || user.email}</div>
            <div><span className="text-gray-500 font-medium">Phone:</span> {employee.phone || '-'}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <h3 className="text-md font-semibold text-gray-800 border-b pb-2">Bank & Compensation</h3>
          <div className="text-sm space-y-2">
            <div><span className="text-gray-500 font-medium">Bank:</span> {employee.banks?.name || '-'}</div>
            <div><span className="text-gray-500 font-medium">Account No:</span> {employee.bank_account || '-'}</div>
            <div><span className="text-gray-500 font-medium">Account Name:</span> {employee.bank_account_name || '-'}</div>
            {compensation && (
              <div className="pt-2 border-t mt-2">
                <span className="text-gray-500 font-medium">Basic Salary:</span> Rp {Number(compensation.basic_salary).toLocaleString('id-ID')}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <h3 className="text-md font-semibold text-gray-800 border-b pb-2">Emergency Contact</h3>
          <div className="text-sm space-y-2">
            <div><span className="text-gray-500 font-medium">Contact Name:</span> {employee.emergency_contact_name || '-'}</div>
            <div><span className="text-gray-500 font-medium">Contact Phone:</span> {employee.emergency_contact_phone || '-'}</div>
            <div><span className="text-gray-500 font-medium">Address:</span> {employee.address || '-'}</div>
          </div>
        </div>
      </div>

      {/* Payslips Table */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
        <h3 className="text-md font-semibold text-gray-800 border-b pb-2">My Payslips</h3>
        {payslips && payslips.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <th className="p-3">Period</th>
                  <th className="p-3">Base Salary</th>
                  <th className="p-3">Total Earnings</th>
                  <th className="p-3">Total Deductions</th>
                  <th className="p-3">Net Salary</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {payslips.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="p-3 font-medium">{String(p.period_month).padStart(2, '0')}-{p.period_year}</td>
                    <td className="p-3">Rp {Number(p.base_salary).toLocaleString('id-ID')}</td>
                    <td className="p-3 text-green-600">Rp {Number(p.total_earnings).toLocaleString('id-ID')}</td>
                    <td className="p-3 text-red-600">Rp {Number(p.total_deductions).toLocaleString('id-ID')}</td>
                    <td className="p-3 font-bold">Rp {Number(p.net_salary).toLocaleString('id-ID')}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${p.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400 py-2">No payslips available yet.</p>
        )}
      </div>

      {/* Loans Table */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
        <h3 className="text-md font-semibold text-gray-800 border-b pb-2">My Loans</h3>
        {loans && loans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <th className="p-3">Request Date</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Tenor (Months)</th>
                  <th className="p-3">Monthly Installment</th>
                  <th className="p-3">Purpose</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loans.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="p-3">{l.request_date}</td>
                    <td className="p-3 font-medium">Rp {Number(l.amount).toLocaleString('id-ID')}</td>
                    <td className="p-3">{l.tenor_months}</td>
                    <td className="p-3">Rp {Number(l.monthly_installment).toLocaleString('id-ID')}</td>
                    <td className="p-3 text-gray-500">{l.purpose || '-'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${l.status === 'APPROVED' || l.status === 'DISBURSED' ? 'bg-green-100 text-green-800' : l.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400 py-2">No loan records found.</p>
        )}
      </div>

      {/* Attendance Table */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
        <h3 className="text-md font-semibold text-gray-800 border-b pb-2">Recent Attendance & Lateness Records</h3>
        {attendances && attendances.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <th className="p-3">Date</th>
                  <th className="p-3">Clock In</th>
                  <th className="p-3">Clock Out</th>
                  <th className="p-3">Status / Lateness</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {attendances.map((att) => (
                  <tr key={att.id} className="hover:bg-gray-50">
                    <td className="p-3 font-medium">{att.attendance_date}</td>
                    <td className="p-3">{att.clock_in || '-'}</td>
                    <td className="p-3">{att.clock_out || '-'}</td>
                    <td className="p-3">
                      {att.is_late ? (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          Late ({att.late_minutes} mins)
                        </span>
                      ) : att.is_no_show ? (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          No Show
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          On Time
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400 py-2">No attendance history logged yet.</p>
        )}
      </div>
    </div>
  )
}
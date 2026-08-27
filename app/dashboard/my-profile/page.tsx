import { createClient } from '../../../utils/supabase/server'
import { createAdminClient } from '../../../utils/supabase/admin'
import { redirect } from 'next/navigation'
import { submitLeaveRequest, submitLoanRequest } from './actions'

export default async function MyProfilePage() {
  const supabase = await createClient()
  const adminSupabase = createAdminClient()

  // 1. Ensure user is authenticated
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect('/login')
  }

  // 2. Fetch user role from profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select(`roles (code)`)
    .eq('id', user.id)
    .single()

  const rawRoles: any = profile?.roles
  const roleCode = (
    Array.isArray(rawRoles) 
      ? rawRoles[0]?.code 
      : rawRoles?.code
  )?.toUpperCase() || ''

  const isAdminOrOwner = ['ADMIN', 'OWNER', 'HRD', 'HR', 'HR_ADMIN'].includes(roleCode)

  // 3. STRICT ACCESS CONTROL: Redirect Admins/Owners to main dashboard
  if (isAdminOrOwner) {
    redirect('/dashboard')
  }

  // 4. Fetch Employee details
  const { data: employee, error } = await adminSupabase
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

  // 5. Fetch ESS records using adminSupabase to bypass RLS blocks
  const { data: compensation } = await adminSupabase
    .from('employee_compensation')
    .select('*')
    .eq('employee_id', employee.id)
    .order('effective_from', { ascending: false })
    .limit(1)
    .single()

  const { data: payslips } = await adminSupabase
    .from('payslips')
    .select('*')
    .eq('employee_id', employee.id)
    .order('period_year', { ascending: false })
    .order('period_month', { ascending: false })

  const { data: loans } = await adminSupabase
    .from('employee_loans')
    .select('*')
    .eq('employee_id', employee.id)
    .order('created_at', { ascending: false })

  // 6. Fetch Available Leave Types for form dropdown
  const { data: leaveTypes } = await adminSupabase
    .from('leave_types')
    .select('id, name')
    .order('name', { ascending: true })

  // 7. Fetch Leave Requests joined with leave_types
  const { data: leaves } = await adminSupabase
    .from('leave_requests')
    .select(`
      *,
      leave_types (name)
    `)
    .eq('employee_id', employee.id)
    .order('created_at', { ascending: false })

  // 8. Fetch Monthly Lateness Data from employee_lateness
  const { data: latenessRecords } = await adminSupabase
    .from('employee_lateness')
    .select('*')
    .eq('employee_id', employee.id)
    .order('period_year', { ascending: false })
    .order('period_month', { ascending: false })

  // 9. Fetch Daily Attendances from attendances (if logged)
  const { data: attendances } = await adminSupabase
    .from('attendances')
    .select('*')
    .eq('employee_id', employee.id)
    .order('attendance_date', { ascending: false })
    .limit(15)

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
  }

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

      {/* Profile Details Grid */}
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

      {/* Leave Requests & History Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
        <h3 className="text-md font-semibold text-gray-800 border-b pb-2">Leave Requests</h3>
        
        {/* Leave Request Form */}
        <form action={submitLeaveRequest} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-md border border-gray-200">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Leave Type</label>
            <select name="leave_type_id" required className="w-full rounded-md border border-gray-300 p-2 bg-white focus:ring-blue-500">
              <option value="">-- Select Leave Type --</option>
              {leaveTypes && leaveTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Reason</label>
            <input type="text" name="reason" placeholder="e.g. Family matter" required className="w-full rounded-md border border-gray-300 p-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
            <input type="date" name="start_date" required className="w-full rounded-md border border-gray-300 p-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
            <input type="date" name="end_date" required className="w-full rounded-md border border-gray-300 p-2 focus:ring-blue-500" />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-colors text-sm">
              Submit Leave Request
            </button>
          </div>
        </form>

        {/* Leave History Table */}
        {leaves && leaves.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <th className="p-3">Type</th>
                  <th className="p-3">Start Date</th>
                  <th className="p-3">End Date</th>
                  <th className="p-3">Total Days</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {leaves.map((l: any) => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="p-3 font-medium">{l.leave_types?.name || 'Leave'}</td>
                    <td className="p-3">{l.start_date}</td>
                    <td className="p-3">{l.end_date}</td>
                    <td className="p-3 font-semibold">{l.total_days} days</td>
                    <td className="p-3 text-gray-500">{l.reason || '-'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${l.status === 'APPROVED' ? 'bg-green-100 text-green-800' : l.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400 py-2">No leave requests submitted yet.</p>
        )}
      </div>

      {/* Loan Application & History Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
        <h3 className="text-md font-semibold text-gray-800 border-b pb-2">My Loans</h3>

        {/* Loan Application Form */}
        <form action={submitLoanRequest} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-gray-50 p-4 rounded-md border border-gray-200">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Loan Amount (IDR)</label>
            <input type="number" name="amount" min="100000" step="50000" placeholder="e.g. 2000000" required className="w-full rounded-md border border-gray-300 p-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tenor (Months)</label>
            <select name="tenor_months" required className="w-full rounded-md border border-gray-300 p-2 bg-white focus:ring-blue-500">
              <option value="1">1 Month</option>
              <option value="3">3 Months</option>
              <option value="6">6 Months</option>
              <option value="12">12 Months</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Purpose</label>
            <input type="text" name="purpose" placeholder="e.g. Medical emergency" required className="w-full rounded-md border border-gray-300 p-2 focus:ring-blue-500" />
          </div>

          <div className="md:col-span-3 flex justify-end">
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-md transition-colors text-sm">
              Submit Loan Application
            </button>
          </div>
        </form>

        {/* Loan History Table */}
        {loans && loans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <th className="p-3">Request Date</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Tenor</th>
                  <th className="p-3">Installment</th>
                  <th className="p-3">Purpose</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loans.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="p-3">{l.request_date}</td>
                    <td className="p-3 font-medium">Rp {Number(l.amount).toLocaleString('id-ID')}</td>
                    <td className="p-3">{l.tenor_months} mos</td>
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

      {/* Monthly Lateness & Deductions Table */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
        <h3 className="text-md font-semibold text-gray-800 border-b pb-2">Monthly Lateness & Deduction Summary</h3>
        {latenessRecords && latenessRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <th className="p-3">Period</th>
                  <th className="p-3">Total Late Minutes</th>
                  <th className="p-3">Calculated Deduction</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {latenessRecords.map((lat) => (
                  <tr key={lat.id} className="hover:bg-gray-50">
                    <td className="p-3 font-medium">
                      {new Date(2000, lat.period_month - 1).toLocaleString('en-US', { month: 'long' })} {lat.period_year}
                    </td>
                    <td className="p-3 font-semibold">
                      {lat.late_minutes} mins
                    </td>
                    <td className="p-3 font-bold text-red-600">
                      {formatIDR(lat.deduction_amount)}
                    </td>
                    <td className="p-3">
                      {lat.late_minutes > 60 ? (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          Exceeded Free Buffer
                        </span>
                      ) : lat.late_minutes > 0 ? (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                          Within Buffer
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Perfect Attendance
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400 py-2">No monthly lateness records saved yet.</p>
        )}
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

      {/* Daily Attendance Logs */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
        <h3 className="text-md font-semibold text-gray-800 border-b pb-2">Recent Daily Clock-In Logs</h3>
        {attendances && attendances.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <th className="p-3">Date</th>
                  <th className="p-3">Clock In</th>
                  <th className="p-3">Clock Out</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {attendances.map((att) => (
                  <tr key={att.id} className="hover:bg-gray-50">
                    <td className="p-3 font-medium">{att.attendance_date}</td>
                    <td className="p-3">{att.clock_in ? att.clock_in.substring(0, 5) : '-'}</td>
                    <td className="p-3">{att.clock_out ? att.clock_out.substring(0, 5) : '-'}</td>
                    <td className="p-3">
                      {att.is_no_show ? (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          Absent / No Show
                        </span>
                      ) : att.is_late || att.late_minutes > 0 ? (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          Late ({att.late_minutes} mins)
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
          <p className="text-sm text-gray-400 py-2">No daily attendance logs found.</p>
        )}
      </div>
    </div>
  )
}
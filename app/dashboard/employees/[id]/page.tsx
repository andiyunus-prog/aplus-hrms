import { createClient } from '../../../../utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  
  // Await the params to get the ID safely (Next.js 15 requirement)
  const { id } = await params

  // Fetch the specific employee (the '*' fetches ALL columns, including the new optional ones)
  const { data: employee } = await supabase
    .from('employees')
    .select('*, companies(name, legal_name)')
    .eq('id', id)
    .single()

  if (!employee) {
    notFound()
  }

  // Format dates for display
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/employees"
          className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2"
        >
          &larr; Back to Employees
        </Link>
      </div>

      {/* Header Profile Card */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {employee.full_name} {employee.nickname ? <span className="text-gray-400 text-xl font-medium">({employee.nickname})</span> : ''}
          </h1>
          <p className="text-gray-500 mt-1">
            {employee.department ? `${employee.department} • ` : ''} 
            Code: {employee.employee_code}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
          employee.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {employee.status}
        </span>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Employment Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Employment Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Company</p>
              <p className="font-medium text-gray-900">{employee.companies?.legal_name || employee.companies?.name || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">Employment Status</p>
              <p className="font-medium text-gray-900">{employee.employment_status}</p>
            </div>
            <div>
              <p className="text-gray-500">Hire Date</p>
              <p className="font-medium text-gray-900">{formatDate(employee.hire_date)}</p>
            </div>
            <div>
              <p className="text-gray-500">Resign Date</p>
              <p className="font-medium text-gray-900">{formatDate(employee.resign_date)}</p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Personal Information</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">NIK (National ID)</p>
              <p className="font-medium text-gray-900">{employee.nik}</p>
            </div>
            <div>
              <p className="text-gray-500">NPWP (Tax ID)</p>
              <p className="font-medium text-gray-900">{employee.npwp || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">Birth Date</p>
              <p className="font-medium text-gray-900">{formatDate(employee.birth_date)}</p>
            </div>
            <div>
              <p className="text-gray-500">Birth Place</p>
              <p className="font-medium text-gray-900">{employee.birth_place || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">Gender</p>
              <p className="font-medium text-gray-900">{employee.gender}</p>
            </div>
            <div>
              <p className="text-gray-500">Religion</p>
              <p className="font-medium text-gray-900">{employee.religion}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-500">Marital Status</p>
              <p className="font-medium text-gray-900">{employee.marital_status}</p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Contact & Emergency</h2>
          <div className="grid grid-cols-1 gap-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{employee.email || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{employee.phone || '-'}</p>
              </div>
            </div>
            <div>
              <p className="text-gray-500">Address</p>
              <p className="font-medium text-gray-900">{employee.address || '-'}</p>
            </div>
            
            <div className="mt-2 pt-3 border-t border-gray-100">
              <p className="text-gray-500 font-medium mb-2">Emergency Contact</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-xs uppercase">Name</p>
                  <p className="font-medium text-gray-900">{employee.emergency_contact_name || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase">Phone</p>
                  <p className="font-medium text-gray-900">{employee.emergency_contact_phone || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bank Info & Notes */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Financial & Additional Info</h2>
          <div className="grid grid-cols-1 gap-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500">Bank Account Name</p>
                <p className="font-medium text-gray-900">{employee.bank_account_name || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500">Account Number</p>
                <p className="font-medium text-gray-900">{employee.bank_account || '-'}</p>
              </div>
            </div>
            
            <div className="mt-2 pt-3 border-t border-gray-100">
              <p className="text-gray-500 font-medium mb-1">Internal Notes</p>
              <div className="bg-gray-50 p-3 rounded-md border border-gray-100 min-h-[4rem]">
                <p className="text-gray-700 whitespace-pre-wrap">{employee.notes || 'No notes added.'}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
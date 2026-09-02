export const dynamic = 'force-dynamic'

import { createAdminClient } from '../../../utils/supabase/admin'
import { createCompany, addDepartment, deleteDepartment } from './actions'
import CompanyTable from './company-table'
import { getCurrentUserRole } from '../../../utils/supabase/auth'
import { redirect } from 'next/navigation'

export default async function CompaniesPage() {
  const adminSupabase = createAdminClient()

  // SECURITY GUARD: Lock out regular employees
  const userRole = await getCurrentUserRole()
  const isRegularEmployee = !['OWNER', 'ADMIN', 'HRD', 'HR', 'HR_ADMIN'].includes(userRole || '')

  if (isRegularEmployee) {
    redirect('/dashboard/my-profile')
  }

  // Fetch companies with nested departments
  const { data: companies, error } = await adminSupabase
    .from('companies')
    .select(`
      *,
      departments (*)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('--- ERROR FETCHING COMPANIES ---', error.message)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Company & Department Management</h1>
        <p className="text-gray-500 mt-1">Manage subsidiaries, branches, and preset organizational departments.</p>
      </div>

      {/* Add Company Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Company</h2>
        <form action={createCompany} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
            <input type="text" name="name" required placeholder="e.g. Aplus Digital Tech" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Code / Reg No.</label>
            <input type="text" name="code" placeholder="e.g. ADT-001" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" placeholder="contact@company.com" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="text" name="phone" placeholder="+62 812..." className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea name="address" rows={2} placeholder="Office address..." className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-md text-sm transition-colors">Save Company</button>
          </div>
        </form>
      </div>

      {/* Preset Departments Quick Management Panel */}
      {companies && companies.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Preset Company Departments</h2>
            <p className="text-xs text-gray-500 mt-0.5">Configure department choices per company to populate dropdowns during employee setup.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {companies.map((company: any) => (
              <div key={company.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50 space-y-3">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="font-semibold text-gray-900 text-sm">{company.name}</span>
                  <span className="text-[10px] bg-gray-200 text-gray-700 font-mono px-2 py-0.5 rounded">
                    {company.code || 'NO CODE'}
                  </span>
                </div>

                {/* Existing Departments List */}
                <div className="flex flex-wrap gap-1.5 min-h-[32px] items-center">
                  {company.departments && company.departments.length > 0 ? (
                    company.departments.map((dept: any) => (
                      <span key={dept.id} className="inline-flex items-center gap-1 bg-white border border-gray-300 text-gray-700 text-xs px-2.5 py-1 rounded-md font-medium shadow-2xs">
                        {dept.name}
                        <form action={deleteDepartment} className="inline">
                          <input type="hidden" name="id" value={dept.id} />
                          <button type="submit" className="text-gray-400 hover:text-red-500 font-bold ml-1 transition-colors" title="Delete department">
                            ✕
                          </button>
                        </form>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400 italic">No preset departments added yet.</span>
                  )}
                </div>

                {/* Add Department Input */}
                <form action={addDepartment} className="flex gap-2 pt-1 text-xs">
                  <input type="hidden" name="company_id" value={company.id} />
                  <input 
                    type="text" 
                    name="name" 
                    placeholder="New Dept (e.g. Kitchen, HR)" 
                    required 
                    className="flex-1 rounded border border-gray-300 px-2.5 py-1.5 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" 
                  />
                  <button type="submit" className="bg-gray-800 hover:bg-gray-900 text-white px-3 py-1.5 rounded font-medium transition-colors">
                    Add
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Render the Client Table */}
      <CompanyTable companies={companies || []} />
    </div>
  )
}
import { createClient } from '../../../../utils/supabase/server'
import { createSalaryComponent } from './actions'
import ComponentsTable from './components-table'
import Link from 'next/link'

type CompanyOption = {
  id: string
  name: string | null
  legal_name: string | null
}

type SalaryComponent = {
  id: string
  company_id: string
  name: string
  type: string
  is_default: boolean
  companies: {
    name: string | null
    legal_name: string | null
  } | null
}

export default async function PayrollSettingsPage() {
  const supabase = await createClient()

  // Fetch companies for the dropdown
  const { data: rawCompanies } = await supabase
    .from('companies')
    .select('id, name, legal_name')
    .order('legal_name', { ascending: true })

  const companies = rawCompanies as unknown as CompanyOption[]

  // Fetch existing salary components
  const { data: rawComponents } = await supabase
    .from('salary_components')
    .select('*, companies(name, legal_name)')
    .order('created_at', { ascending: false })

  const components = rawComponents as unknown as SalaryComponent[]

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/payroll"
          className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2"
        >
          &larr; Back to Payroll Overview
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payroll Settings</h1>
        <p className="text-gray-500 mt-1">Define company-wide allowances and deductions (e.g., Transportation, BPJS, Taxes).</p>
      </div>

      {/* Add Component Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Add Salary Component</h2>
        <form action={createSalaryComponent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
            <select
              name="company_id"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Company --</option>
              {companies?.map((comp) => (
                <option key={comp.id} value={comp.id}>
                  {comp.legal_name || comp.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Component Name *</label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Transport Allowance, Health Insurance"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <select
              name="type"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="EARNING">Earning (Addition)</option>
              <option value="DEDUCTION">Deduction (Subtraction)</option>
            </select>
          </div>

          <div className="flex items-center mt-6">
            <input
              type="checkbox"
              id="is_default"
              name="is_default"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
            />
            <label htmlFor="is_default" className="ml-2 block text-sm text-gray-900 cursor-pointer">
              <strong>Set as Default</strong> <span className="text-gray-500">- Automatically apply to all new payslips.</span>
            </label>
          </div>

          <div className="md:col-span-2 flex justify-end pt-2 border-t border-gray-100">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-md text-sm transition-colors"
            >
              Save Component
            </button>
          </div>
        </form>
      </div>

      <ComponentsTable components={components || []} />
    </div>
  )
}
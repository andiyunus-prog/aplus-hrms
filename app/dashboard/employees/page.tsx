import { createClient } from '../../../utils/supabase/server'
import { createEmployee } from './actions'
import EmployeeTable from './employee-table'

export default async function EmployeesPage() {
  const supabase = await createClient()

  // Fetch employees joined with companies table
  const { data: employees } = await supabase
    .from('employees')
    .select('*, companies(id, name, legal_name)')
    .order('created_at', { ascending: false })

  // Fetch active companies for selection dropdown
  const { data: companies } = await supabase
    .from('companies')
    .select('id, name, legal_name')
    .order('legal_name', { ascending: true })

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
        <p className="text-gray-500 mt-1">Add, update, and manage your workforce across all companies.</p>
      </div>

      {/* Add Employee Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Employee</h2>
        <form action={createEmployee} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee Code *</label>
            <input
              type="text"
              name="employee_code"
              required
              placeholder="e.g. EMP-001"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              name="full_name"
              required
              placeholder="e.g. John Doe"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NIK (National ID) *</label>
            <input
              type="text"
              name="nik"
              required
              placeholder="e.g. 3201..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              placeholder="john.doe@company.com"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              name="phone"
              placeholder="+62 812..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input
              type="text"
              name="department"
              placeholder="e.g. Engineering"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Position</label>
            <input
              type="text"
              name="job_position"
              placeholder="e.g. Chef, Waiters, Assistant Chef, Cook"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
            <select
              name="gender"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="MALE">MALE</option>
              <option value="FEMALE">FEMALE</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Religion *</label>
            <select
              name="religion"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ISLAM">ISLAM</option>
              <option value="PROTESTANT">PROTESTANT</option>
              <option value="CATHOLIC">CATHOLIC</option>
              <option value="HINDU">HINDU</option>
              <option value="BUDDHIST">BUDDHIST</option>
              <option value="CONFUCIAN">CONFUCIAN</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status *</label>
            <select
              name="marital_status"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="SINGLE">SINGLE</option>
              <option value="MARRIED">MARRIED</option>
              <option value="DIVORCED">DIVORCED</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employment Status *</label>
            <select
              name="employment_status"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="PROBATION">PROBATION</option>
              <option value="PERMANENT">PERMANENT</option>
              <option value="CONTRACT">CONTRACT</option>
              <option value="DAILY">DAILY</option>
              <option value="PART_TIME">PART_TIME</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Birth Date *</label>
            <input
              type="date"
              name="birth_date"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date *</label>
            <input
              type="date"
              name="hire_date"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-md text-sm transition-colors"
            >
              Save Employee
            </button>
          </div>
        </form>
      </div>

      <EmployeeTable employees={employees || []} companies={companies || []} />
    </div>
  )
}
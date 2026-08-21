'use client'

import { useState } from 'react'
import { upsertBaseSalary } from './actions'

type Employee = {
  id: string
  full_name: string
  employee_code: string
  department: string | null
  companies: { name: string | null } | null
  // Changed from array [] to a single object (or an array fallback just in case)
  employee_salaries: { base_salary: number } | { base_salary: number }[] | null
}

export default function SalaryTable({ employees }: { employees: Employee[] }) {
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  // Bulletproof helper that handles both objects and arrays
  const getSalary = (emp: Employee) => {
    if (!emp.employee_salaries) return 0
    
    // If Supabase returned an array
    if (Array.isArray(emp.employee_salaries)) {
      return emp.employee_salaries.length > 0 ? emp.employee_salaries[0].base_salary : 0
    }
    
    // If Supabase returned a direct object (One-to-One)
    return emp.employee_salaries.base_salary || 0
  }

  // Format as Indonesian Rupiah (IDR)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const filtered = employees.filter((emp) => {
    const term = search.toLowerCase()
    return (
      emp.full_name.toLowerCase().includes(term) ||
      emp.employee_code.toLowerCase().includes(term) ||
      (emp.companies?.name && emp.companies.name.toLowerCase().includes(term))
    )
  })

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-800">Employee Base Salaries</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 rounded-md border border-gray-300 px-3 py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-3">Employee</th>
              <th className="px-6 py-3">Company & Dept</th>
              <th className="px-6 py-3">Base Salary</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
            {filtered.length > 0 ? (
              filtered.map((emp) => {
                const currentSalary = getSalary(emp)
                const isEditing = editingId === emp.id

                return (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{emp.full_name}</div>
                      <div className="text-xs text-gray-500">Code: {emp.employee_code}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{emp.companies?.name || '-'}</div>
                      <div className="text-xs text-gray-500">{emp.department || 'No Dept'}</div>
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <form
                          id={`form-${emp.id}`}
                          action={async (formData) => {
                            await upsertBaseSalary(formData)
                            setEditingId(null) // Close input on success
                          }}
                        >
                          <input type="hidden" name="employee_id" value={emp.id} />
                          <input
                            type="number"
                            name="base_salary"
                            defaultValue={currentSalary}
                            min="0"
                            step="1000"
                            autoFocus
                            className="w-32 rounded-md border border-gray-300 px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </form>
                      ) : (
                        <span className={`font-semibold ${currentSalary > 0 ? 'text-gray-900' : 'text-red-500'}`}>
                          {currentSalary > 0 ? formatCurrency(currentSalary) : 'Not Set'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {isEditing ? (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="text-gray-500 hover:text-gray-700 text-xs font-medium px-2 py-1"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            form={`form-${emp.id}`}
                            className="text-white bg-blue-600 hover:bg-blue-700 text-xs font-medium px-3 py-1 rounded transition-colors"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditingId(emp.id)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >
                          Edit Salary
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                  {search ? 'No employees found.' : 'No active employees.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
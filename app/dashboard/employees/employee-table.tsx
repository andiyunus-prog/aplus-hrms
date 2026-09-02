'use client'

import { useState } from 'react'
import EditEmployeeModal from './edit-employee-modal'
import { deleteEmployee } from './actions'
import Link from 'next/link'

type Company = {
  id: string
  name?: string
  legal_name?: string
}

type Department = {
  id: string
  company_id: string
  name: string
}

type Employee = {
  id: string
  company_id: string
  employee_code: string
  full_name: string
  nickname: string | null
  nik: string
  npwp: string | null
  gender: string
  religion: string
  birth_place: string | null
  birth_date: string
  hire_date: string
  resign_date: string | null
  employment_status: string
  marital_status: string
  email: string | null
  phone: string | null
  address: string | null
  department: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  bank_account: string | null
  bank_account_name: string | null
  notes: string | null
  status: string
  auth_user_id?: string | null
  companies?: Company | null
}

export default function EmployeeTable({
  employees,
  companies,
  departments = [],
}: {
  employees: Employee[]
  companies: Company[]
  departments?: Department[]
}) {
  const [search, setSearch] = useState('')

  const filtered = employees.filter((emp) => {
    const term = search.toLowerCase()
    return (
      emp.full_name.toLowerCase().includes(term) ||
      emp.employee_code.toLowerCase().includes(term) ||
      emp.nik.toLowerCase().includes(term) ||
      (emp.email && emp.email.toLowerCase().includes(term)) ||
      (emp.department && emp.department.toLowerCase().includes(term))
    )
  })

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-800">Employees List</h2>
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
              <th className="px-6 py-3">Code / Name</th>
              <th className="px-6 py-3">Department</th>
              <th className="px-6 py-3">Contact</th>
              <th className="px-6 py-3">Login Status</th>
              <th className="px-6 py-3">Company</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
            {filtered.length > 0 ? (
              filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <div>{emp.full_name}</div>
                    <div className="text-xs text-gray-400">Code: {emp.employee_code} | NIK: {emp.nik}</div>
                  </td>
                  <td className="px-6 py-4">{emp.department || '-'}</td>
                  <td className="px-6 py-4">
                    <div>{emp.email || '-'}</div>
                    <div className="text-xs text-gray-400">{emp.phone || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    {emp.auth_user_id ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Has Login
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                        No Login
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {emp.companies ? (emp.companies.legal_name || emp.companies.name) : '-'}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap space-x-2">
                    <Link
                      href={`/dashboard/employees/${emp.id}/financials`}
                      className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded font-medium hover:bg-indigo-100 inline-block"
                    >
                      Financials &rarr;
                    </Link>

                    <EditEmployeeModal employee={emp} companies={companies} />
                    
                    <form action={deleteEmployee} className="inline-block">
                      <input type="hidden" name="id" value={emp.id} />
                      <button type="submit" className="text-xs bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded font-medium hover:bg-red-100">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  {search ? 'No employees found matching your search.' : 'No employees added yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
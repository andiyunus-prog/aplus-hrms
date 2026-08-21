'use client'

import { useState } from 'react'
import { deleteSalaryComponent } from './actions'

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

export default function ComponentsTable({ components }: { components: SalaryComponent[] }) {
  const [search, setSearch] = useState('')

  const filtered = components.filter((comp) => {
    const term = search.toLowerCase()
    return (
      comp.name.toLowerCase().includes(term) ||
      (comp.companies?.name && comp.companies.name.toLowerCase().includes(term))
    )
  })

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-800">Salary Components</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search components..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 rounded-md border border-gray-300 px-3 py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <th className="px-6 py-3">Component Name</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Company</th>
              <th className="px-6 py-3">Default</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
            {filtered.length > 0 ? (
              filtered.map((comp) => (
                <tr key={comp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{comp.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide ${
                      comp.type === 'EARNING' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {comp.type === 'EARNING' ? '+ EARNING' : '- DEDUCTION'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {comp.companies ? (comp.companies.legal_name || comp.companies.name) : '-'}
                  </td>
                  <td className="px-6 py-4">
                    {comp.is_default ? (
                      <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs font-medium">Yes (Auto-apply)</span>
                    ) : (
                      <span className="text-gray-400">No</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <form action={deleteSalaryComponent} className="inline-block">
                      <input type="hidden" name="id" value={comp.id} />
                      <button type="submit" className="text-red-600 hover:text-red-800 text-xs font-medium">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  {search ? 'No components found.' : 'No salary components created yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
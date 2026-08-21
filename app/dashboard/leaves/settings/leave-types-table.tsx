'use client'

import { useState } from 'react'
import { deleteLeaveType } from './actions'

type LeaveTypeItem = {
  id: string
  company_id: string
  name: string
  code: string
  description: string | null
  days_allowed: number
  is_active: boolean
  companies: {
    name: string | null
    legal_name: string | null
  } | null
}

export default function LeaveTypesTable({ leaveTypes }: { leaveTypes: LeaveTypeItem[] }) {
  const [search, setSearch] = useState('')

  const filtered = leaveTypes.filter((lt) => {
    const term = search.toLowerCase()
    return (
      lt.name.toLowerCase().includes(term) ||
      lt.code.toLowerCase().includes(term) ||
      (lt.companies?.name && lt.companies.name.toLowerCase().includes(term))
    )
  })

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-800">Existing Leave Types</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name or code..."
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
              <th className="px-6 py-3">Code / Name</th>
              <th className="px-6 py-3">Company</th>
              <th className="px-6 py-3">Quota (Days/Yr)</th>
              <th className="px-6 py-3">Description</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
            {filtered.length > 0 ? (
              filtered.map((lt) => (
                <tr key={lt.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded">
                        {lt.code}
                      </span>
                      <span>{lt.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {lt.companies ? (lt.companies.legal_name || lt.companies.name) : '-'}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-800">
                    {lt.days_allowed} day(s)
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs truncate max-w-[200px]">
                    {lt.description || '-'}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <form action={deleteLeaveType} className="inline-block">
                      <input type="hidden" name="id" value={lt.id} />
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
                  {search ? 'No leave types found.' : 'No leave types created yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { updateLeaveStatus, deleteLeaveRequest } from './actions'

type LeaveRequest = {
  id: string
  start_date: string
  end_date: string
  total_days: number
  reason: string
  status: string
  created_at: string
  employees: {
    full_name: string
    employee_code: string
    department: string | null
    companies?: {
      name: string | null
      legal_name: string | null
    } | null
  } | null
  leave_types: {
    name: string
    code: string
  } | null
}

export default function LeaveTable({ requests }: { requests: LeaveRequest[] }) {
  const [search, setSearch] = useState('')

  const filtered = requests.filter((req) => {
    const term = search.toLowerCase()
    return (
      req.employees?.full_name.toLowerCase().includes(term) ||
      req.leave_types?.name.toLowerCase().includes(term) ||
      req.status.toLowerCase().includes(term)
    )
  })

  // Helper to colorize status badges
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span>
      case 'REJECTED': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>
      case 'CANCELLED': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Cancelled</span>
      default: return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>
    }
  }

  // Format date helper
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-800">Leave Requests</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search employee or status..."
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
              <th className="px-6 py-3">Type & Reason</th>
              <th className="px-6 py-3">Dates</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
            {filtered.length > 0 ? (
              filtered.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{req.employees?.full_name}</div>
                    <div className="text-xs text-gray-500">
                      {req.employees?.department || 'No Dept'} • {req.employees?.companies?.name || 'No Company'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{req.leave_types?.name}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[200px]">{req.reason}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900">{formatDate(req.start_date)} - {formatDate(req.end_date)}</div>
                    <div className="text-xs font-medium text-gray-500">{req.total_days} day(s)</div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(req.status)}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap space-x-2">
                    {req.status === 'PENDING' && (
                      <>
                        <form action={updateLeaveStatus} className="inline-block">
                          <input type="hidden" name="id" value={req.id} />
                          <input type="hidden" name="status" value="APPROVED" />
                          <button type="submit" className="text-green-600 hover:text-green-800 text-xs font-medium px-2 py-1 rounded bg-green-50 hover:bg-green-100 transition-colors">Approve</button>
                        </form>
                        <form action={updateLeaveStatus} className="inline-block">
                          <input type="hidden" name="id" value={req.id} />
                          <input type="hidden" name="status" value="REJECTED" />
                          <button type="submit" className="text-red-600 hover:text-red-800 text-xs font-medium px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition-colors">Reject</button>
                        </form>
                      </>
                    )}
                    <form action={deleteLeaveRequest} className="inline-block ml-2 border-l pl-3 border-gray-200">
                      <input type="hidden" name="id" value={req.id} />
                      <button type="submit" className="text-gray-400 hover:text-red-600 text-xs font-medium transition-colors">Delete</button>
                    </form>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  {search ? 'No requests found.' : 'No leave requests created yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
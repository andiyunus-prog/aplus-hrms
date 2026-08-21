'use client'

import { useState } from 'react'
import EditCompanyModal from './edit-company-modal'
import { deleteCompany } from './actions'

// 1. Updated type to use legal_name
type Company = {
  id: string
  legal_name: string 
  code: string | null
  email: string | null
  phone: string | null
  address: string | null
}

export default function CompanyTable({ companies }: { companies: Company[] }) {
  const [search, setSearch] = useState('')

  const filteredCompanies = companies.filter((company) => {
    const term = search.toLowerCase()
    return (
      // 2. Updated search filter to check legal_name
      company.legal_name.toLowerCase().includes(term) ||
      (company.code?.toLowerCase().includes(term)) ||
      (company.email?.toLowerCase().includes(term))
    )
  })

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-800">Companies List</h2>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 rounded-md border border-gray-300 px-3 py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Code</th>
              <th className="px-6 py-3">Contact</th>
              <th className="px-6 py-3">Address</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
            {filteredCompanies.length > 0 ? (
              filteredCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  {/* 3. Updated table cell to display legal_name */}
                  <td className="px-6 py-4 font-medium text-gray-900">{company.legal_name}</td>
                  <td className="px-6 py-4">{company.code || '-'}</td>
                  <td className="px-6 py-4">
                    <div>{company.email || '-'}</div>
                    <div className="text-xs text-gray-400">{company.phone}</div>
                  </td>
                  <td className="px-6 py-4 truncate max-w-xs">{company.address || '-'}</td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <EditCompanyModal company={company} />
                    <form action={deleteCompany} className="inline-block">
                      <input type="hidden" name="id" value={company.id} />
                      <button type="submit" className="text-red-600 hover:text-red-800 text-xs font-medium">Delete</button>
                    </form>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  {search ? 'No companies found matching your search.' : 'No companies created yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
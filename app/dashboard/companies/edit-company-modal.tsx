'use client'

import { useState } from 'react'
import { updateCompany } from './actions'

// 1. Restored the Company type and updated to legal_name
type Company = {
  id: string
  legal_name: string
  code: string | null
  email: string | null
  phone: string | null
  address: string | null
}

export default function EditCompanyModal({ company }: { company: Company }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-blue-600 hover:text-blue-800 text-xs font-medium mr-3"
      >
        Edit
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 text-left">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-lg font-semibold text-gray-900">Edit Company</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-semibold"
              >
                ✕
              </button>
            </div>

            <form
              action={async (formData) => {
                await updateCompany(formData)
                setIsOpen(false)
              }}
              className="space-y-4"
            >
              <input type="hidden" name="id" value={company.id} />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                {/* 2. Updated defaultValue to company.legal_name. We keep name="name" because that's what the formData expects! */}
                <input type="text" name="name" defaultValue={company.legal_name} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Code / Reg No.</label>
                <input type="text" name="code" defaultValue={company.code || ''} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" name="email" defaultValue={company.email || ''} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="text" name="phone" defaultValue={company.phone || ''} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea name="address" rows={2} defaultValue={company.address || ''} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
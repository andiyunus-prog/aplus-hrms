'use client'

import { useState } from 'react'
import { createEmployee } from './actions'

type Company = {
  id: string
  name?: string
  legal_name?: string
}

export default function CreateEmployeeModal({ companies }: { companies: Company[] }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
      >
        + Add New Employee
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 text-left">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-900">Add New Employee</h3>
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
                await createEmployee(formData)
                setIsOpen(false)
              }}
              className="space-y-6"
            >
              {/* Login Account */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b pb-1">
                  System Login Credentials
                </h4>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Assign Login Username (Optional)
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      name="username"
                      placeholder="e.g. johndoe"
                      className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:ring-blue-500 bg-white"
                    />
                    <span className="text-xs text-gray-500 whitespace-nowrap">@aplusgroup.my.id</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Setting a username automatically creates their Supabase Auth account with a matching default password.
                  </p>
                </div>
              </div>

              {/* Employment */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b pb-1">
                  Employment Info
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Company *</label>
                    <select name="company_id" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500">
                      <option value="">Select Company</option>
                      {companies.map((comp) => (
                        <option key={comp.id} value={comp.id}>{comp.legal_name || comp.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Employee Code *</label>
                    <input type="text" name="employee_code" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Status *</label>
                    <select name="status" defaultValue="ACTIVE" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500">
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
                    <input type="text" name="department" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Job Position</label>
                    <input type="text" name="job_position" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Employment Status *</label>
                    <select name="employment_status" defaultValue="PROBATION" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500">
                      <option value="PROBATION">PROBATION</option>
                      <option value="PERMANENT">PERMANENT</option>
                      <option value="CONTRACT">CONTRACT</option>
                      <option value="DAILY">DAILY</option>
                      <option value="PART_TIME">PART_TIME</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Hire Date *</label>
                    <input type="date" name="hire_date" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500" />
                  </div>
                </div>
              </div>

              {/* Personal */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b pb-1">
                  Personal Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                    <input type="text" name="full_name" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nickname</label>
                    <input type="text" name="nickname" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">NIK (ID Number) *</label>
                    <input type="text" name="nik" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">NPWP (Tax ID)</label>
                    <input type="text" name="npwp" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Gender *</label>
                    <select name="gender" defaultValue="MALE" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500">
                      <option value="MALE">MALE</option>
                      <option value="FEMALE">FEMALE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Birth Place</label>
                    <input type="text" name="birth_place" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Birth Date *</label>
                    <input type="date" name="birth_date" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Religion *</label>
                    <select name="religion" defaultValue="ISLAM" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500">
                      <option value="ISLAM">ISLAM</option>
                      <option value="PROTESTANT">PROTESTANT</option>
                      <option value="CATHOLIC">CATHOLIC</option>
                      <option value="HINDU">HINDU</option>
                      <option value="BUDDHIST">BUDDHIST</option>
                      <option value="CONFUCIAN">CONFUCIAN</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Marital Status *</label>
                    <select name="marital_status" defaultValue="SINGLE" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500">
                      <option value="SINGLE">SINGLE</option>
                      <option value="MARRIED">MARRIED</option>
                      <option value="DIVORCED">DIVORCED</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b pb-1">
                  Contact Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" name="email" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                    <input type="text" name="phone" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                    <textarea name="address" rows={2} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Emergency Contact Name</label>
                    <input type="text" name="emergency_contact_name" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Emergency Contact Phone</label>
                    <input type="text" name="emergency_contact_phone" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500" />
                  </div>
                </div>
              </div>

              {/* Financial & Notes */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b pb-1">
                  Bank Info & Notes
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Bank Account Name</label>
                    <input type="text" name="bank_account_name" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Bank Account Number</label>
                    <input type="text" name="bank_account" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Internal Notes</label>
                    <textarea name="notes" rows={2} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 sticky bottom-0 bg-white z-10 py-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Create Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
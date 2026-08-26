'use client'

import { useState } from 'react'
import { updateEmployee } from './actions'

type Company = {
  id: string
  name?: string
  legal_name?: string
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
}

export default function EditEmployeeModal({
  employee,
  companies,
}: {
  employee: Employee
  companies: Company[]
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className="text-blue-600 hover:text-blue-800 text-xs font-medium mr-3">
        Edit
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 text-left">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-900">Edit Employee Profile</h3>
              <button type="button" onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">✕</button>
            </div>

            <form action={async (formData) => { await updateEmployee(formData); setIsOpen(false) }} className="space-y-6">
              <input type="hidden" name="id" value={employee.id} />

              {/* Section 0: System Login */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b pb-1">System Login Account</h4>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {employee.auth_user_id ? 'Login Status' : 'Create Login Username'}
                    </label>
                    {employee.auth_user_id ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                        ✓ Active Login Linked
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-800">
                        ⚠ No Login Account Yet
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {employee.auth_user_id ? 'Update Username (Optional)' : 'Assign Username'}
                    </label>
                    <div className="flex items-center gap-1">
                      <input 
                        type="text" 
                        name="username" 
                        placeholder={employee.auth_user_id ? "Leave blank to keep" : "e.g. andi"} 
                        className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:ring-blue-500 bg-white" 
                      />
                      <span className="text-xs text-gray-500 whitespace-nowrap">@aplusgroup.my.id</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {employee.auth_user_id 
                        ? 'Fill only if you want to change the login handle.' 
                        : 'Type a username to auto-create their login and default password.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 1: Employment Details */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b pb-1">Employment</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Company *</label>
                    <select name="company_id" defaultValue={employee.company_id} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500">
                      {companies.map((comp) => (
                        <option key={comp.id} value={comp.id}>{comp.legal_name || comp.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Employee Code *</label>
                    <input type="text" name="employee_code" defaultValue={employee.employee_code} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Profile Status *</label>
                    <select name="status" defaultValue={employee.status} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500">
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
                    <input type="text" name="department" defaultValue={employee.department || ''} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Employment Status *</label>
                    <select name="employment_status" defaultValue={employee.employment_status} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500">
                      <option value="PROBATION">PROBATION</option>
                      <option value="PERMANENT">PERMANENT</option>
                      <option value="CONTRACT">CONTRACT</option>
                      <option value="DAILY">DAILY</option>
                      <option value="PART_TIME">PART_TIME</option>
                      <option value="RESIGNED">RESIGNED</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Hire Date *</label>
                    <input type="date" name="hire_date" defaultValue={employee.hire_date ? employee.hire_date.substring(0, 10) : ''} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Resign Date</label>
                    <input type="date" name="resign_date" defaultValue={employee.resign_date ? employee.resign_date.substring(0, 10) : ''} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500" />
                  </div>
                </div>
              </div>

              {/* Section 2: Personal Details */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b pb-1">Personal Info</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                    <input type="text" name="full_name" defaultValue={employee.full_name} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nickname</label>
                    <input type="text" name="nickname" defaultValue={employee.nickname || ''} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">NIK (ID) *</label>
                    <input type="text" name="nik" defaultValue={employee.nik} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">NPWP (Tax ID)</label>
                    <input type="text" name="npwp" defaultValue={employee.npwp || ''} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Gender *</label>
                    <select name="gender" defaultValue={employee.gender} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500">
                      <option value="MALE">MALE</option>
                      <option value="FEMALE">FEMALE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Birth Place</label>
                    <input type="text" name="birth_place" defaultValue={employee.birth_place || ''} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Birth Date *</label>
                    <input type="date" name="birth_date" defaultValue={employee.birth_date ? employee.birth_date.substring(0, 10) : ''} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Religion *</label>
                    <select name="religion" defaultValue={employee.religion} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500">
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
                    <select name="marital_status" defaultValue={employee.marital_status} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500">
                      <option value="SINGLE">SINGLE</option>
                      <option value="MARRIED">MARRIED</option>
                      <option value="DIVORCED">DIVORCED</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Contact Details */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b pb-1">Contact & Emergency</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" name="email" defaultValue={employee.email || ''} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                    <input type="text" name="phone" defaultValue={employee.phone || ''} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                    <textarea name="address" rows={2} defaultValue={employee.address || ''} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Emergency Contact Name</label>
                    <input type="text" name="emergency_contact_name" defaultValue={employee.emergency_contact_name || ''} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Emergency Contact Phone</label>
                    <input type="text" name="emergency_contact_phone" defaultValue={employee.emergency_contact_phone || ''} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500" />
                  </div>
                </div>
              </div>

              {/* Section 4: Bank & Extras */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b pb-1">Bank Info & Notes</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Bank Account Name</label>
                    <input type="text" name="bank_account_name" defaultValue={employee.bank_account_name || ''} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Bank Account Number</label>
                    <input type="text" name="bank_account" defaultValue={employee.bank_account || ''} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Internal Notes</label>
                    <textarea name="notes" rows={2} defaultValue={employee.notes || ''} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 sticky bottom-0 bg-white z-10 py-2">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
'use client'

import { useState } from 'react'
import { updatePassword } from './actions'

export default function ChangePasswordCard() {
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setStatus(null)
    setLoading(true)

    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirm_password') as string

    if (password.length < 6) {
      setStatus({ message: 'Password must be at least 6 characters.', type: 'error' })
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setStatus({ message: 'Passwords do not match.', type: 'error' })
      setLoading(false)
      return
    }

    await updatePassword(formData)
    setStatus({ message: 'Password updated successfully!', type: 'success' })
    setLoading(false)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
      <div className="border-b pb-2">
        <h3 className="text-md font-semibold text-gray-800">Security & Account Settings</h3>
        <p className="text-xs text-gray-500 mt-0.5">Change your system login password.</p>
      </div>

      {status && (
        <div className={`p-3 rounded-md text-xs font-medium ${status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {status.message}
        </div>
      )}

      <form action={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">New Password *</label>
          <input 
            type="password" 
            name="password" 
            required 
            minLength={6} 
            placeholder="Minimum 6 characters" 
            className="w-full rounded-md border border-gray-300 p-2 text-xs bg-white focus:ring-blue-500" 
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Confirm New Password *</label>
          <input 
            type="password" 
            name="confirm_password" 
            required 
            minLength={6} 
            placeholder="Re-enter password" 
            className="w-full rounded-md border border-gray-300 p-2 text-xs bg-white focus:ring-blue-500" 
          />
        </div>

        <div className="sm:col-span-2 flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white font-medium px-4 py-2 rounded-md transition-colors text-xs"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  )
}
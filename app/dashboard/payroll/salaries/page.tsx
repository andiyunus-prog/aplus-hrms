export const dynamic = 'force-dynamic' // 1. Force Next.js to NEVER cache this page

import { createClient } from '../../../../utils/supabase/server'
import SalaryTable from './salary-table'
import Link from 'next/link'

type Employee = {
  id: string
  full_name: string
  employee_code: string
  department: string | null
  companies: { name: string | null } | null
  employee_salaries: { base_salary: number } | { base_salary: number }[] | null
}

export default async function BaseSalariesPage() {
  const supabase = await createClient()

  // Fetch employees and join their current base salary if it exists
  const { data: rawEmployees, error } = await supabase
    .from('employees')
    .select(`
      id, 
      full_name, 
      employee_code, 
      department,
      companies (name),
      employee_salaries (base_salary)
    `)
    // 2. We remove the strict 'ACTIVE' filter temporarily so EVERYONE shows up
    .order('full_name', { ascending: true })

  if (error) {
    console.error("Error fetching employees for salaries:", error.message)
  }

  const employees = rawEmployees as unknown as Employee[]

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/payroll"
          className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2"
        >
          &larr; Back to Payroll Overview
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Base Salaries</h1>
        <p className="text-gray-500 mt-1">Assign and manage the fixed base salary for all employees.</p>
      </div>

      <SalaryTable employees={employees || []} />
    </div>
  )
}
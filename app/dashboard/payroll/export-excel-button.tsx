'use client'

import ExcelJS from 'exceljs'

interface PayslipExportProps {
  employeeName: string
  employeeCode: string
  period: string
  basicSalary: number
  allowances: number
  loanDeduction: number
  otherDeductions: number
  netSalary: number
}

export default function ExportExcelButton({
  employeeName,
  employeeCode,
  period,
  basicSalary,
  allowances,
  loanDeduction,
  otherDeductions,
  netSalary,
}: PayslipExportProps) {

  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Payslip')

    // Define column widths
    worksheet.columns = [
      { width: 35 },
      { width: 18 },
      { width: 22 },
    ]

    // Title Section
    worksheet.addRow(['APLUS GROUP - SLIP GAJI / PAYSLIP']).font = { bold: true, size: 14 }
    worksheet.addRow([`Period: ${period}`]).font = { italic: true, size: 11 }
    worksheet.addRow([])

    // Employee Info Section
    worksheet.addRow(['EMPLOYEE INFORMATION']).font = { bold: true, size: 11 }
    worksheet.addRow(['Employee Name:', employeeName])
    worksheet.addRow(['Employee Code:', employeeCode])
    worksheet.addRow([])

    // Table Header
    worksheet.addRow(['EARNINGS & DEDUCTIONS BREAKDOWN']).font = { bold: true, size: 11 }
    
    const headerRow = worksheet.addRow(['Description', 'Category', 'Amount (Rp)'])
    headerRow.font = { bold: true }
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F3F4F6' } // Light gray background
      }
    })

    // Data Rows
    const dataRows = [
      worksheet.addRow(['Gaji Pokok / Basic Salary', 'EARNING', basicSalary]),
      worksheet.addRow(['Tunjangan / Allowances', 'EARNING', allowances]),
      worksheet.addRow(['Potongan Kasbon / Loan Deduction', 'DEDUCTION', -loanDeduction]),
      worksheet.addRow(['Potongan Lain / Other Deductions', 'DEDUCTION', -otherDeductions]),
    ]

    // Blank line before total
    worksheet.addRow([])

    // Net Salary / Take Home Pay Row
    const totalRow = worksheet.addRow(['TAKE HOME PAY / NET SALARY', '', netSalary])
    totalRow.font = { bold: true, size: 12 }
    totalRow.getCell(3).font = { bold: true, size: 12, color: { argb: '1E40AF' } } // Dark blue text

    // Border definitions
    const thinBorder: Partial<ExcelJS.Borders> = {
      top: { style: 'thin', color: { argb: 'D1D5DB' } },
      left: { style: 'thin', color: { argb: 'D1D5DB' } },
      bottom: { style: 'thin', color: { argb: 'D1D5DB' } },
      right: { style: 'thin', color: { argb: 'D1D5DB' } }
    }

    // Apply borders & numeric formatting to table cells
    const tableRowIndices = [headerRow.number, ...dataRows.map(r => r.number), totalRow.number]

    tableRowIndices.forEach((rowIndex) => {
      const row = worksheet.getRow(rowIndex)
      for (let col = 1; col <= 3; col++) {
        const cell = row.getCell(col)
        cell.border = thinBorder

        // Apply currency format with thousand separators to Amount column
        if (col === 3 && typeof cell.value === 'number') {
          cell.numFmt = '#,##0'
        }
      }
    })

    // Generate buffer & trigger download in browser
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `Payslip_${employeeCode}_${period.replace(/\s+/g, '_')}.xlsx`
    anchor.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleExport}
      className="bg-green-600 hover:bg-green-700 text-white font-medium text-xs px-4 py-2 rounded-md shadow-sm transition-colors flex items-center gap-1.5"
    >
      📊 Export to Excel (.xlsx)
    </button>
  )
}
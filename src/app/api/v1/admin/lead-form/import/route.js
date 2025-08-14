import { NextResponse } from 'next/server'
import connectMongoDB from '@/libs/mongodb'
import Leadform from '@/models/Leadform'
import * as XLSX from 'xlsx'

export async function POST(req) {
  await connectMongoDB()

  try {
    // Get FormData directly from request
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 })
    }

    // Convert to Buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Read Excel file
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])

    let savedRecords = []
    let skippedRecords = []

    for (let i = 0; i < sheetData.length; i++) {
      const row = sheetData[i]

      // Duplicate check by lead_id OR Email Address
      const existingLead = await Leadform.findOne({
        $or: [{ lead_id: row['Lead ID'] }, { 'values.Email Address': row['Email'] }]
      })

      if (existingLead) {
        console.log(`Skipping duplicate: ${row['Lead ID']} / ${row['Email']}`)
        skippedRecords.push(row)
        continue // Skip if duplicate
      }

      const leadData = {
        organization_id: '47b79a7f2d6f',
        auto_inc_id: String(i + 1).padStart(5, '0'),
        lead_name: `CRM LEAD 2025 ${String(i + 1).padStart(5, '0')}`,
        lead_id: row['Lead ID'] || `DT-${String(i + 1).padStart(5, '0')}`,
        lead_slug_name: `crm-lead-2025-${String(i + 1).padStart(5, '0')}`,
        form_name: 'lead-form',
        values: {
          'Full Name': `${row['First Name']} ${row['Last Name']}`.trim(),
          'Email Address': row['Email'],
          'Mobile Number': row['Phone'],
          'Company Name': row['Company'],
          Designation: row['Job Title'],
          Industry: row['Industry'],
          'Lead Source': row['Lead Source'],
          Status: row['Lead Status'],
          Country: row['Country'],
          'City / Location': row['City'],
          State: row['State'],
          'Created Date': row['Created Date'],
          'Last Contact Date': row['Last Contact Date'],
          'Potential Deal Size': row['Potential Deal Size (USD)']
        },
        submittedAt: new Date(row['Created Date']),
        updatedAt: new Date(row['Last Contact Date'])
      }

      const saved = await Leadform.create(leadData)
      savedRecords.push(saved)
    }

    return NextResponse.json({
      success: true,
      imported: savedRecords.length,
      skipped: skippedRecords.length,
      message: `${savedRecords.length} leads imported, ${skippedRecords.length} duplicates skipped`
    })
  } catch (error) {
    console.error('Import Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

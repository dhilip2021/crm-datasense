import { NextResponse } from 'next/server'
import connectMongoDB from '@/libs/mongodb'
import Leadform from '@/models/Leadform'
import * as XLSX from 'xlsx'

export async function POST(req) {
  await connectMongoDB()

  try {
    const formData = await req.formData()
    const file = formData.get('file')
    const organization_id = formData.get('organization_id')

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])

    let batch = []
    let savedCount = 0
    let skippedCount = 0

    for (let i = 0; i < sheetData.length; i++) {
      const row = sheetData[i]

      // Check duplicate
      const existingLead = await Leadform.findOne({
        $or: [
          { lead_id: row['Lead ID'] },
          { 'values.Email Address': row['Email'] }
        ]
      }).lean()

      if (existingLead) {
        skippedCount++
        continue
      }

      // Prepare new lead
      const leadData = {
        organization_id,
        auto_inc_id: String(i + 1).padStart(5, '0'),
        lead_name: `CRM LEAD 2025 ${String(i + 1).padStart(5, '0')}`,
        lead_id: `DT-${String(i + 1).padStart(5, '0')}`,
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

      batch.push(leadData)

      // 🚀 Insert in chunks of 1000
      if (batch.length === 1000) {
        const inserted = await Leadform.insertMany(batch)
        savedCount += inserted.length
        batch = []
      }
    }

    // Insert remaining records if any
    if (batch.length > 0) {
      const inserted = await Leadform.insertMany(batch)
      savedCount += inserted.length
    }

    return NextResponse.json({
      success: true,
      imported: savedCount,
      skipped: skippedCount,
      message: `${savedCount} leads imported, ${skippedCount} duplicates skipped`
    })
  } catch (error) {
    console.error('Import Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

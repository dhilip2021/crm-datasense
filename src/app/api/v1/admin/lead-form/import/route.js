import { NextResponse } from 'next/server'
import connectMongoDB from '@/libs/mongodb'
import Leadform from '@/models/Leadform'
import * as XLSX from 'xlsx'


// 🔥 Lead Scoring Logic
const calculateLeadScore = (values) => {
  let score = 0

  // 🧩 Demographic
  const designation = values['Job Tilte']
  const companySize = values['Company Size']
  const industry = values['Industry']
  const location = values['City']

  if (designation && ['Chief Financial Officer', 'Architect', 'Building services engineer','Licensed conveyancer','Sports development officer', 'CEO', 'Manager', 'Founder'].includes(designation)) score += 25
  if (companySize && parseInt(companySize) > 50) score += 15
  if (industry && ['Logistics', 'Manufacturing', 'Logistics','FMCG','Education','Pharma','Retail'].includes(industry)) score += 20
  if (location && ['Kennethchester','North Austinville','Port Heathertown','South Samanthamouth','Chennai', 'Coimabtore', 'Bangalore','Delhi'].includes(location)) score += 10

  // 📈 Behavioral
  if (Object.values(values).length >= 8) score += 15
  if (values['Clicked Email'] || values['Opened WhatsApp']) score += 10
  if (values['Requested Demo'] || values['Asked for Quote']) score += 20
  if (
    values['Last Contact Date'] &&
    new Date(values['Last Contact Date']) < Date.now() - 7 * 24 * 60 * 60 * 1000
  ) score -= 10

  // 🏷️ Lead Label
  let label = 'Cold Lead'
  if (score >= 75) label = 'Hot Lead'
  else if (score >= 50) label = 'Warm Lead'

  return { lead_score: score, lead_label: label }
}

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


    console.log(sheetData,"<<< SHEET DATAAAA")



    let batch = []
    let savedCount = 0
    let skippedCount = 0

    for (let i = 0; i < sheetData.length; i++) {
      const row = sheetData[i]

      // Check duplicate
      const existingLead = await Leadform.findOne({
        $or: [
          { lead_id: row['Lead ID'] },
          { 'values.Email': row['Email'] }
        ]
      }).lean()

      if (existingLead) {
        skippedCount++
        continue
      }


      const { lead_score, lead_label } = calculateLeadScore(row)

      // Prepare new lead
      const leadData = {
        organization_id,
        auto_inc_id: String(i + 1).padStart(5, '0'),
        lead_name: `CRM LEAD 2025 ${String(i + 1).padStart(5, '0')}`,
        lead_id: `DT-${String(i + 1).padStart(5, '0')}`,
        lead_slug_name: `crm-lead-2025-${String(i + 1).padStart(5, '0')}`,
        form_name: 'lead-form',
        values: {
          'First Name': `${row['First Name']}`.trim(),
          'Last Name': `${row['Last Name']}`.trim(),
          'Email': row['Email'],
          'Phone': row['Phone'],
          'Company': row['Company'],
          'Job Title': row['Job Title'],
          'Industry': row['Industry'],
          'Lead Source': row['Lead Source'],
          'Lead Status': row['Lead Status'],
          'Country': row['Country'],
          'City': row['City'],
          'State': row['State'],
          'Created Date': row['Created Date'],
          'Last Contact Date': row['Last Contact Date'],
          'Potential Deal Size': row['Potential Deal Size (USD)'],
          'lead_score':lead_score,
          'lead_label': lead_label
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

import { create_UUID } from '@/helper/clientHelper'
import connectMongoDB from '@/libs/mongodb'
import Leadform from '@/models/Leadform'
import { NextResponse } from 'next/server'
import slugify from 'slugify'

// 🔥 Lead Scoring Logic
const calculateLeadScore = (values) => {
  let score = 0

  // 🧩 Demographic
  const designation = values['Designation']
  const companySize = values['Company Size']
  const industry = values['Industry']
  const location = values['City / Location']

  if (designation && ['CXO', 'Founder'].includes(designation)) score += 25
  if (companySize && parseInt(companySize) > 200) score += 15
  if (industry && ['Pharma', 'Healthcare', 'Target'].includes(industry)) score += 20
  if (location && ['Chennai', 'Tamil Nadu', 'Bangalore'].includes(location)) score += 10

  // 📈 Behavioral
  if (Object.values(values).length >= 8) score += 15
  if (values['Clicked Email'] || values['Opened WhatsApp']) score += 10
  if (values['Requested Demo'] || values['Asked for Quote']) score += 20
  if (
    values['Last Activity'] &&
    new Date(values['Last Activity']) < Date.now() - 7 * 24 * 60 * 60 * 1000
  ) score -= 10

  // 🏷️ Lead Label
  let label = 'Cold Lead'
  if (score >= 75) label = 'Hot Lead'
  else if (score >= 50) label = 'Warm Lead'

  return { lead_score: score, lead_label: label }
}

export async function POST(req) {
  await connectMongoDB()
  const body = await req.json()

  try {
    const { organization_id, form_name, values } = body

    if (!organization_id || !form_name || !values) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Safe prefix fallback
    const prefix = process.env.NEXT_PUBLIC_LEAD_PREFIX || 'CRM LEAD 2025'

    // Auto-increment ID logic
    const lastEntry = await Leadform.findOne().sort({ _id: -1 }).lean()
    const lastAutoId = lastEntry?.auto_inc_id || ''
    const lastNumber = parseInt(lastAutoId.replace(/\D/g, '')) || 0
    const nextAutoId = String(lastNumber + 1).padStart(5, '0')

    // Generate name & slug
    const lead_name = `${prefix} ${nextAutoId}`
    const slugBase = lead_name.replace(/[^\w\s]/gi, '')
    const lead_slug_name = slugify(slugBase, {
      replacement: '-',
      lower: true,
      trim: true
    })

    // ✅ Lead Scoring
    const { lead_score, lead_label } = calculateLeadScore(values)

    const leadformData = new Leadform({
      organization_id,
      auto_inc_id: nextAutoId,
      lead_id: create_UUID(),
      lead_name,
      lead_slug_name,
      form_name,
      values: {
        ...values,
        Score: lead_score,
        Label: lead_label
      },
      submittedAt: new Date()
    })

    await leadformData.save()

    return NextResponse.json({
      success: true,
      message: 'Lead form saved with score',
      data: {
        organization_id,
        auto_inc_id: nextAutoId,
        lead_name,
        lead_slug_name,
        form_name,
        values: leadformData.values,
        submittedAt: leadformData.submittedAt,
        lead_score,
        lead_label
      }
    })
  } catch (error) {
    console.error('⨯ leadform Error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal Server Error',
        error: error.message
      },
      { status: 500 }
    )
  }
}

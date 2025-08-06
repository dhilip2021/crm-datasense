// File: app/api/v1/admin/lead-form/[lead_id]/route.js

import connectMongoDB from '@/libs/mongodb'
import Leadform from '@/models/Leadform'
import { NextResponse } from 'next/server'


// 🔥 Recalculate score logic
const calculateLeadScore = (values) => {
  let score = 0

  // Demographic
  const designation = values['Designation']
  const companySize = values['Company Size']
  const industry = values['Industry']
  const location = values['City / Location']

  if (designation && ['CXO', 'Founder'].includes(designation)) score += 25
  if (companySize && parseInt(companySize) > 200) score += 15
  if (industry && ['Pharma', 'Healthcare', 'Target'].includes(industry)) score += 20
  if (location && ['Chennai', 'Tamil Nadu', 'Bangalore'].includes(location)) score += 10

  // Behavioral
  if (Object.values(values).length >= 8) score += 15
  if (values['Clicked Email'] || values['Opened WhatsApp']) score += 10
  if (values['Requested Demo'] || values['Asked for Quote']) score += 20
  if (
    values['Last Activity'] &&
    new Date(values['Last Activity']) < Date.now() - 7 * 24 * 60 * 60 * 1000
  ) score -= 10

  // Lead Label
  let label = 'Cold Lead'
  if (score >= 75) label = 'Hot Lead'
  else if (score >= 50) label = 'Warm Lead'

  return { lead_score: score, lead_label: label }
}

export async function GET(req, { params }) {
  await connectMongoDB()

  try {
    const { lead_id } = params

    if (!lead_id) {
      return NextResponse.json(
        { success: false, message: 'Missing lead_id' },
        { status: 400 }
      )
    }

    const lead = await Leadform.findOne({ lead_id }).select('-__v -updatedAt').lean()

    if (!lead) {
      return NextResponse.json(
        { success: false, message: 'Lead not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: lead
    })
  } catch (error) {
    console.error('⨯ Lead fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// 🔁 PUT – Update lead by lead_id
export async function PUT(req, { params }) {
  await connectMongoDB()
  const { lead_id } = params
  const body = await req.json()

  try {
    const lead = await Leadform.findOne({ lead_id })

    if (!lead) {
      return NextResponse.json(
        { success: false, message: 'Lead not found' },
        { status: 404 }
      )
    }

    // 🔁 Recalculate lead score before update
    const { lead_score, lead_label } = calculateLeadScore(body.values)

    const updatedValues = {
      ...body.values,
      Score: lead_score,
      Label: lead_label
    }

    const updated = await Leadform.findOneAndUpdate(
      { lead_id },
      {
        $set: {
          values: updatedValues,
          updatedAt: new Date()
        }
      },
      { new: true }
    )

    return NextResponse.json({
      success: true,
      message: 'Lead updated with recalculated score',
      data: updated
    })
  } catch (error) {
    console.error('⨯ Lead update error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

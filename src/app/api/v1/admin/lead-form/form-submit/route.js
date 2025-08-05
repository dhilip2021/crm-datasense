import { create_UUID } from '@/helper/clientHelper'
import connectMongoDB from '@/libs/mongodb'
import Leadform from '@/models/Leadform'
import { NextResponse } from 'next/server'
import slugify from 'slugify'

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

    // Get last document to generate auto_inc_id
    const lastEntry = await Leadform.findOne().sort({ _id: -1 }).lean()
    const lastAutoId = lastEntry?.auto_inc_id || ''
    const lastNumber = parseInt(lastAutoId.replace(/\D/g, '')) || 0
    const nextAutoId = String(lastNumber + 1).padStart(5, '0')

    // Generate lead name and slug
    const lead_name = `${prefix} ${nextAutoId}`
    const slugBase = lead_name.replace(/[^\w\s]/gi, '')
    const lead_slug_name = slugify(slugBase, {
      replacement: '-',
      lower: true,
      trim: true
    })

    // Create document
    const leadformData = new Leadform({
      organization_id,
      auto_inc_id: nextAutoId,
      lead_id: create_UUID(),
      lead_name,
      lead_slug_name,
      form_name,
      values,
      submittedAt: new Date()
    })

    // Save to DB
    await leadformData.save()

    return NextResponse.json({
      success: true,
      message: 'Lead form saved',
      data: {
        organization_id,
        auto_inc_id: nextAutoId,
        lead_name,
        lead_slug_name,
        form_name,
        values,
        submittedAt: leadformData.submittedAt
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

// File: app/api/v1/admin/lead-form/[lead_id]/route.js

import connectMongoDB from '@/libs/mongodb'
import Leadform from '@/models/Leadform'
import { NextResponse } from 'next/server'

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

    const updated = await Leadform.findOneAndUpdate(
      { lead_id },
      {
        $set: {
          values: body.values,
          updatedAt: new Date()
        }
      },
      { new: true }
    )

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('⨯ Lead update error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

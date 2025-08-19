import { NextResponse } from 'next/server'
import LeadTemplate from '@/models/LeadTemplate' 
import connectMongoDB from '@/libs/mongodb'

export async function PUT(req) {
  await connectMongoDB()
  const body = await req.json()

  const { _id, sections, organization_id, form_name, version } = body

  if (!_id) {
    return NextResponse.json({ success: false, error: '_id is required' }, { status: 400 })
  }

  try {
    const updated = await LeadTemplate.findByIdAndUpdate(
      _id,
      { sections, organization_id, form_name, version },
      { new: true }
    )

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Form not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Update Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

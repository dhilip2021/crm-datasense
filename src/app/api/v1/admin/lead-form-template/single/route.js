import { NextResponse } from 'next/server'
import LeadTemplate from '@/models/LeadTemplate' 
import connectMongoDB from '@/libs/mongodb'

export async function GET(req) {
      await connectMongoDB()

  const { searchParams } = new URL(req.url)
  const orgId = searchParams.get('organization_id')
  const formName = searchParams.get('form_name')

  if (!orgId || !formName) {
    return NextResponse.json(
      { success: false, error: 'organization_id and form_name are required' },
      { status: 400 }
    )
  }

  try {
    const form = await LeadTemplate.findOne({
      organization_id: orgId,
      form_name: formName
    })

    if (!form) {
      return NextResponse.json(
        { success: false, error: 'Form not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: form
    })
  } catch (error) {
    console.error('Fetch Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

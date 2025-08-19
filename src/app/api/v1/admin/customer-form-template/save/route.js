import { NextResponse } from 'next/server'
import connectMongoDB from '@/libs/mongodb'
import CustomerTemplate from '@/models/CustomerTemplate'


export async function POST(req) {
  await connectMongoDB()
  const body = await req.json()

  try {
    const saved = await CustomerTemplate.create({
      organization_id: body.organization_id,
      form_name: body.form_name,
      version: 1,
      sections: body.sections,
    })
    return NextResponse.json({ success: true, data: saved })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

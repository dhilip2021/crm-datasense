// app/api/form-layout/list/route.js
import { NextResponse } from 'next/server'
import LeadTemplate from '@/models/LeadTemplate' 
import connectMongoDB from '@/libs/mongodb'

export async function GET() {
    await connectMongoDB()
  const data = await LeadTemplate.find().sort({ updatedAt: -1 })
  return NextResponse.json({ success: true, data })
}

// app/api/form-layout/list/route.js
import { NextResponse } from 'next/server'
import connectMongoDB from '@/libs/mongodb'
import CustomerTemplate from '@/models/CustomerTemplate'

export async function GET() {
    await connectMongoDB()
  const data = await CustomerTemplate.find().sort({ updatedAt: -1 })
  return NextResponse.json({ success: true, data })
}

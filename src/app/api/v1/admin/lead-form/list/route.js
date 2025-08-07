import connectMongoDB from '@/libs/mongodb'
import Leadform from '@/models/Leadform'
import { NextResponse } from 'next/server'

export async function GET(req) {
  await connectMongoDB()

  try {
    const { searchParams } = new URL(req.url)

    const organization_id = searchParams.get('organization_id')
    const form_name = searchParams.get('form_name')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const source = searchParams.get('source') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const from = searchParams.get('from') // YYYY-MM-DD
    const to = searchParams.get('to') // YYYY-MM-DD

    if (!organization_id || !form_name) {
      return NextResponse.json({ success: false, message: 'Missing organization_id or form_name' }, { status: 400 })
    }

    const query = {
      organization_id,
      form_name
    }

    // 🔍 Search by lead_name (case-insensitive partial match)
    if (search) {
      query.lead_id = { $regex: search, $options: 'i' }
    }

    if (status) {
      query['values.Status'] = { $regex: status, $options: 'i' }
    }
     if (source) {
        query['values.Lead Source'] = { $regex: source, $options: 'i' }
      }

    // 📅 Filter by date range
    if (from || to) {
      query.submittedAt = {}
      if (from) query.submittedAt.$gte = new Date(from)
      if (to) query.submittedAt.$lte = new Date(to + 'T23:59:59')
    }

    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      Leadform.find(query).sort({ submittedAt: -1 }).skip(skip).limit(limit).select('-__v').lean(),
      Leadform.countDocuments(query)
    ])

    return NextResponse.json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data
    })
  } catch (error) {
    console.error('⨯ Lead form list error:', error)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}

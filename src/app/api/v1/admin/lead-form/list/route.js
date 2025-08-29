import connectMongoDB from '@/libs/mongodb'
import Leadform from '@/models/Leadform'
import { UserRole } from '@/models/userRoleModel'
import { verifyAccessToken } from '@/helper/clientHelper'
import { NextResponse } from 'next/server'

export async function GET(req) {
  await connectMongoDB()

  const verified = verifyAccessToken()
  if (!verified.success) {
    return NextResponse.json({ success: false, error: 'token expired!' }, { status: 400 })
  }

  try {
    const { searchParams } = new URL(req.url)

    const organization_id = searchParams.get('organization_id')
    const form_name = searchParams.get('form_name')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const source = searchParams.get('source') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    // 🟢 STEP 1: Find current user role
    const userRole = await UserRole.findOne({ c_role_id: verified.data.c_role_id }).lean()
    if (!userRole) {
      return NextResponse.json({ success: false, message: 'Invalid role' }, { status: 403 })
    }

    const currentPriority = userRole.c_role_priority

    // 🟢 STEP 2: Find roles within hierarchy (priority >= currentPriority)
    const allowedRoles = await UserRole.find({ c_role_priority: { $gte: currentPriority } })
      .select('c_role_id c_role_priority')
      .lean()

    const allowedRoleIds = allowedRoles.map(r => r.c_role_id)

    // 🟢 STEP 3: Build query
    let query = {}

    if (userRole.c_role_name === 'Super Admin') {
      // 🔥 Super Admin → All leads
      if (form_name) query.form_name = form_name
    } else {
      // Others → restrict by org & form
      if (!organization_id || !form_name) {
        return NextResponse.json({ success: false, message: 'Missing organization_id or form_name' }, { status: 400 })
      }
      query.organization_id = organization_id
      query.form_name = form_name

      // 🔥 Only include allowed roles leads
      query.c_role_id = { $in: allowedRoleIds }

      // 🔥 Special case → Sales Executive (lowest priority) can only see own leads
      if (userRole.c_role_name.toLowerCase() === 'sales executive') {
        query.c_createdBy = verified.data.c_user_id // only own created leads
      }
    }

    // 🔍 Search
    if (search) {
      query.$or = [
        { lead_id: { $regex: search, $options: 'i' } },
        { 'values.First Name': { $regex: search, $options: 'i' } },
        { 'values.Last Name': { $regex: search, $options: 'i' } },
        { 'values.Company': { $regex: search, $options: 'i' } },
        { 'values.Email': { $regex: search, $options: 'i' } },
        { 'values.Phone': { $regex: search, $options: 'i' } },
        { 'values.City': { $regex: search, $options: 'i' } },
        { 'values.Job Title': { $regex: search, $options: 'i' } }
      ]
    }

    if (status) query['values.Lead Status'] = { $regex: status, $options: 'i' }
    if (source) query['values.Lead Source'] = { $regex: source, $options: 'i' }

    if (from || to) {
      query.submittedAt = {}
      if (from) query.submittedAt.$gte = new Date(from)
      if (to) query.submittedAt.$lte = new Date(to + 'T23:59:59')
    }

    // 🟢 Pagination
    const skip = (page - 1) * limit

    console.log(query, '<<< queryyyy')

    const [data, total] = await Promise.all([
      Leadform.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).select('-__v').lean(),
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

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
    const touch = searchParams.get('touch') || ''
    const assign = searchParams.get('assign') || ''
    const source = searchParams.get('source') || ''
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const fromFollow = searchParams.get('fromFollowDate')
    const toFollow = searchParams.get('toFollowDate')

    // 🟢 STEP 1: Find current user role
    const userRole = await UserRole.findOne({ c_role_id: verified.data.c_role_id }).lean()
    if (!userRole) {
      return NextResponse.json({ success: false, message: 'Invalid role' }, { status: 403 })
    }

    const currentPriority = userRole.c_role_priority

    // 🟢 STEP 2: Build base query
    let query = {}

    if (userRole.c_role_name === 'Super Admin') {
      if (form_name) query.form_name = form_name
    } else {
      if (!organization_id || !form_name) {
        return NextResponse.json({ success: false, message: 'Missing organization_id or form_name' }, { status: 400 })
      }

      query.organization_id = organization_id
      query.form_name = form_name

      const lowerRoles = await UserRole.find({ c_role_priority: { $gt: currentPriority } })
        .select('c_role_id')
        .lean()

      let lowerRoleIds = lowerRoles.map(r => r.c_role_id)

      query.$or = [
        { c_createdBy: verified.data.user_id },
        { c_role_id: { $in: lowerRoleIds } },
        { 'values.Assigned To': String(verified.data.user_id) }
      ]
    }

    // 🔍 Filters
    if (search) {
      const searchFilter = {
        $or: [
          { lead_id: { $regex: search, $options: 'i' } },
          { 'values.First Name': { $regex: search, $options: 'i' } },
          { 'values.Last Name': { $regex: search, $options: 'i' } },
          { 'values.Company': { $regex: search, $options: 'i' } },
          { 'values.Email': { $regex: search, $options: 'i' } },
          { 'values.Phone': { $regex: search, $options: 'i' } },
          { 'values.City': { $regex: search, $options: 'i' } },
          { 'values.Job Title': { $regex: search, $options: 'i' } },
          { 'values.Notes.note': { $regex: search, $options: 'i' } },
          { 'values.Notes.title': { $regex: search, $options: 'i' } }
        ]
      }
      query.$and = query.$and || []
      query.$and.push(searchFilter)
    }

    if (status) {
      query.$and = query.$and || []
      query.$and.push({ 'values.Lead Status': { $regex: status, $options: 'i' } })
    }

    if (touch) {
      query.$and = query.$and || []
      query.$and.push({ lead_touch: touch })
    }

    if (source) {
      query.$and = query.$and || []
      query.$and.push({ 'values.Lead Source': { $regex: source, $options: 'i' } })
    }

    if (assign) {
      query.$and = query.$and || []
      query.$and.push({ 'values.Assigned To': { $regex: assign, $options: 'i' } })
    }

    if (from || to) {
      const dateFilter = {}
      if (from) dateFilter.$gte = new Date(from)
      if (to) dateFilter.$lte = new Date(to + 'T23:59:59')
      query.$and = query.$and || []
      query.$and.push({ createdAt: dateFilter })
    }

    if (fromFollow || toFollow) {
      const fromDate = fromFollow ? new Date(fromFollow) : null
      const toDate = toFollow ? new Date(toFollow + 'T23:59:59') : null

      query.$and = query.$and || []
      query.$and.push({
        $expr: {
          $and: [
            fromDate ? { $gte: [{ $toDate: '$values.Next Follow-up Date' }, fromDate] } : {},
            toDate ? { $lte: [{ $toDate: '$values.Next Follow-up Date' }, toDate] } : {}
          ].filter(Boolean)
        }
      })
    }

    // 🟢 Fetch All Data (No Pagination)
    const data = await Leadform.aggregate([
      { $match: query },
      { $sort: { lead_flag: -1, updatedAt: -1, createdAt: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: 'c_createdBy',
          foreignField: 'user_id',
          as: 'createdUser'
        }
      },
      {
        $lookup: {
          from: 'users',
          let: { assignedId: '$values.Assigned To' },
          pipeline: [
            { $match: { $expr: { $eq: ['$user_id', '$$assignedId'] } } },
            { $project: { user_name: 1, user_id: 1, _id: 0 } }
          ],
          as: 'assignedTo'
        }
      },
      {
        $addFields: {
          createdByName: { $arrayElemAt: ['$createdUser.user_name', 0] },
          assignedTo: { $arrayElemAt: ['$assignedTo.user_name', 0] }
        }
      },
      {
        $project: {
          __v: 0,
          createdUser: 0
        }
      }
    ])

    return NextResponse.json({
      success: true,
      total: data.length,
      data
    })
  } catch (error) {
    console.error('⨯ Lead form list error:', error)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req) {
  await connectMongoDB()

  const verified = verifyAccessToken()
  if (!verified.success) {
    return NextResponse.json({ success: false, error: 'token expired!' }, { status: 400 })
  }

  try {
    const body = await req.json()
    const {
      organization_id,
      form_name,
      c_createdBy,
      search = '',
      status = '',
      touch = '',
      assign = '',
      source = '',
      region = '',
      from,
      to,
      fromFollow,
      toFollow,
      page = 1,
      limit = 10
    } = body

    // 🟢 STEP 1: Find current user role
    const userRole = await UserRole.findOne({ c_role_id: verified.data.c_role_id }).lean()
    if (!userRole) {
      return NextResponse.json({ success: false, message: 'Invalid role' }, { status: 403 })
    }

    const currentPriority = userRole.c_role_priority

    // 🟢 STEP 2: Build base query
    let query = {}

    if (userRole.c_role_name === 'Super Admin') {
      if (form_name) query.form_name = form_name
    } else {
      if (!organization_id || !form_name) {
        return NextResponse.json({ success: false, message: 'Missing organization_id or form_name' }, { status: 400 })
      }

      query.organization_id = organization_id
      query.form_name = form_name

      const lowerRoles = await UserRole.find({ c_role_priority: { $gt: currentPriority } })
        .select('c_role_id')
        .lean()

      let lowerRoleIds = lowerRoles.map(r => r.c_role_id)

      // Step: check c_createdBy filter
      let createdByFilter = {}
      if (Array.isArray(c_createdBy) && c_createdBy.length > 0) {
        createdByFilter = { c_createdBy: { $in: c_createdBy } } // use $in for array
      } else if (c_createdBy) {
        createdByFilter = { c_createdBy } // single value fallback
      }

      query.$or = [
        createdByFilter,
        { c_role_id: { $in: lowerRoleIds } },
        { 'values.Assigned To': { $in: Array.isArray(c_createdBy) ? c_createdBy : [c_createdBy] } } // make sure array
      ]
    }

    // 🔍 Filters
    if (search) {
      const searchFilter = {
        $or: [
          { lead_id: { $regex: search, $options: 'i' } },
          { 'values.First Name': { $regex: search, $options: 'i' } },
          { 'values.Last Name': { $regex: search, $options: 'i' } },
          { 'values.Company': { $regex: search, $options: 'i' } },
          { 'values.Email': { $regex: search, $options: 'i' } },
          { 'values.Phone': { $regex: search, $options: 'i' } },
          { 'values.City': { $regex: search, $options: 'i' } },
          { 'values.Job Title': { $regex: search, $options: 'i' } },
          { 'values.Notes.note': { $regex: search, $options: 'i' } },
          { 'values.Notes.title': { $regex: search, $options: 'i' } }
        ]
      }
      query.$and = query.$and || []
      query.$and.push(searchFilter)
    }

    if (status) {
      query.$and = query.$and || []
      query.$and.push({ 'values.Lead Status': { $regex: status, $options: 'i' } })
    }

    if (touch) {
      query.$and = query.$and || []
      query.$and.push({ lead_touch: touch })
    }

    if (source) {
      query.$and = query.$and || []
      query.$and.push({ 'values.Lead Source': { $regex: source, $options: 'i' } })
    }

    if (assign) {
      query.$and = query.$and || []
      query.$and.push({ 'values.Assigned To': { $regex: assign, $options: 'i' } })
    }

    if (region) {
      query.$and = query.$and || []
      query.$and.push({ 'values.Region': { $regex: region, $options: 'i' } })
    }

    if (from || to) {
      const dateFilter = {}
      if (from) dateFilter.$gte = new Date(from)
      if (to) dateFilter.$lte = new Date(to + 'T23:59:59')
      query.$and = query.$and || []
      query.$and.push({ updatedAt: dateFilter })
    }

    if (fromFollow || toFollow) {
      const fromDate = fromFollow ? new Date(fromFollow) : null
      const toDate = toFollow ? new Date(toFollow + 'T23:59:59') : null

      query.$and = query.$and || []
      query.$and.push({
        $expr: {
          $and: [
            fromDate ? { $gte: [{ $toDate: '$values.Next Follow-up Date' }, fromDate] } : {},
            toDate ? { $lte: [{ $toDate: '$values.Next Follow-up Date' }, toDate] } : {}
          ].filter(Boolean)
        }
      })
    }

    // 🟢 STEP 3: Main Aggregation (same as GET)
    const pipeline = [
      { $match: query },
      { $sort: { lead_flag: -1, updatedAt: -1, createdAt: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: 'c_createdBy',
          foreignField: 'user_id',
          as: 'createdUser'
        }
      },
      {
        $lookup: {
          from: 'users',
          let: { assignedId: '$values.Assigned To' },
          pipeline: [
            { $match: { $expr: { $eq: ['$user_id', '$$assignedId'] } } },
            { $project: { user_name: 1, user_id: 1, _id: 0 } }
          ],
          as: 'assignedTo'
        }
      },
      {
        $addFields: {
          createdByName: { $arrayElemAt: ['$createdUser.user_name', 0] },
          assignedTo: { $arrayElemAt: ['$assignedTo.user_name', 0] }
        }
      },
      {
        $project: {
          __v: 0,
          createdUser: 0
        }
      },
      { $skip: (page - 1) * limit },
      { $limit: limit }
    ]

    const data = await Leadform.aggregate(pipeline)

    // 🟢 Count total
    const countPipeline = [{ $match: query }, { $count: 'total' }]
    const countResult = await Leadform.aggregate(countPipeline)
    const total = countResult[0]?.total || 0

    return NextResponse.json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data
    })
  } catch (error) {
    console.error('⨯ Lead form list POST error:', error)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}

import connectMongoDB from '@/libs/mongodb'
import Leadform from '@/models/Leadform'
import { UserRole } from '@/models/userRoleModel'
import { verifyAccessToken } from '@/helper/clientHelper'
import { NextResponse } from 'next/server'

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
      search = '',
      status = '',
      touch = '',
      assign = '',
      source = '',
      region = '',
      c_createdBy = [],
      from,
      to,
      page = 1,
      limit = 10
    } = body

    // 🔹 Step 1: Check user role
    const userRole = await UserRole.findOne({
      c_role_id: verified.data.c_role_id
    }).lean()

    if (!userRole) {
      return NextResponse.json({ success: false, message: 'Invalid role' }, { status: 403 })
    }

    const currentPriority = userRole.c_role_priority

    // 🔹 Step 2: Build Query
    let query = {}

    if (userRole.c_role_name === 'Super Admin') {
      if (form_name) query.form_name = form_name
    } else {
      if (!organization_id || !form_name) {
        return NextResponse.json(
          { success: false, message: 'Missing organization_id or form_name' },
          { status: 400 }
        )
      }

      query = {
        organization_id,
        form_name,
        $and: [
          {
            $or: [
              {
                'values.Activity': {
                  $elemMatch: {
                    task: {
                      $elemMatch: { owner: { $in: c_createdBy } }
                    }
                  }
                }
              }
            ]
          }
        ]
      }
    }

    // 🔹 Step 3: Apply Filters
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
      query.$and.push(searchFilter)
    }

    if (status) query.$and.push({ 'values.Lead Status': { $regex: status, $options: 'i' } })
    if (touch) query.$and.push({ lead_touch: touch })
    if (source) query.$and.push({ 'values.Lead Source': { $regex: source, $options: 'i' } })
    if (assign) query.$and.push({ 'values.Assigned To': { $regex: assign, $options: 'i' } })
    if (region) query.$and.push({ 'values.Region': { $regex: region, $options: 'i' } })

    // 🔹 Date Filter
    if (from || to) {
      const dateFilter = {}
      if (from) dateFilter.$gte = new Date(from)
      if (to) dateFilter.$lte = new Date(to + 'T23:59:59')
      query.$and.push({ updatedAt: dateFilter })
    }

    // 🔹 Mongo Aggregation
    const pipeline = [
      { $match: query },
      { $sort: { lead_flag: -1, updatedAt: -1, createdAt: -1 } },
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
          assignedTo: { $arrayElemAt: ['$assignedTo.user_name', 0] }
        }
      },
      {
        $project: {
          __v: 0
        }
      },
      { $skip: (page - 1) * limit },
      { $limit: limit }
    ]

    const data = await Leadform.aggregate(pipeline)

    // 🔹 Count Total
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

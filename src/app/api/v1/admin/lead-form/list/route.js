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

    // 🟢 STEP 2: Build base query
    let query = {}

    if (userRole.c_role_name === 'Super Admin') {
      // 🔥 Super Admin => All leads
      if (form_name) query.form_name = form_name
    } else {
      if (!organization_id || !form_name) {
        return NextResponse.json({ success: false, message: 'Missing organization_id or form_name' }, { status: 400 })
      }

      query.organization_id = organization_id
      query.form_name = form_name

      if (userRole.c_role_name === 'Sales Executive') {
        // 🔥 Sales Exec => only own leads
        // query.c_createdBy = verified.data.user_id
        const lowerRoles = await UserRole.find({ c_role_priority: { $gt: currentPriority } })
          .select('c_role_id')
          .lean()

        let lowerRoleIds = lowerRoles.map(r => r.c_role_id)

        query.$or = [
          { c_createdBy: verified.data.user_id }, // ✅ own leads always
          { c_role_id: { $in: lowerRoleIds } }, // ✅ lower roles
          { 'values.Assigned To': String(verified.data.user_id) } // ✅ assigned to me
        ]
      } else {
        // 🔥 Admin / Manager => own + lower role leads
        const lowerRoles = await UserRole.find({ c_role_priority: { $gt: currentPriority } })
          .select('c_role_id')
          .lean()

        let lowerRoleIds = lowerRoles.map(r => r.c_role_id)

        query.$or = [
          { c_createdBy: verified.data.user_id }, // ✅ own leads always
          { c_role_id: { $in: lowerRoleIds } }, // ✅ lower roles
          { 'values.Assigned To': String(verified.data.user_id) } // ✅ assigned to me
        ]
      }
    }
    // 🔍 Search
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
          { 'values.Job Title': { $regex: search, $options: 'i' } }
        ]
      }

      query.$and = query.$and || []
      query.$and.push(searchFilter)
    }

    // 🔍 Status
    if (status) {
      query.$and = query.$and || []
      query.$and.push({ 'values.Lead Status': { $regex: status, $options: 'i' } })
    }

    // 🔍 Source
    if (source) {
      query.$and = query.$and || []
      query.$and.push({ 'values.Lead Source': { $regex: source, $options: 'i' } })
    }

    // 🔍 Date Range
    if (from || to) {
      const dateFilter = {}
      if (from) dateFilter.$gte = new Date(from)
      if (to) dateFilter.$lte = new Date(to + 'T23:59:59')

      query.$and = query.$and || []
      query.$and.push({ submittedAt: dateFilter })
    }

    // 🟢 Pagination
    const skip = (page - 1) * limit

    // 🔄 Replace find() with aggregate + lookup
    const [data, total] = await Promise.all([
      Leadform.aggregate([
        { $match: query },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'users', // 🔥 collection name in DB
            localField: 'c_createdBy',
            foreignField: 'user_id',
            as: 'createdUser'
          }
        },
        {
          $lookup: {
            from: 'users',
            let: { assignedId: '$values.Assigned To' }, // 👈 take from nested field
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
            assignedTo: { $arrayElemAt: ['$assignedTo.user_name', 0] } // 👈 pick assigned user name
          }
        },
        {
          $project: {
            __v: 0,
            createdUser: 0
          }
        }
      ]),
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
export async function POST(req) {
  await connectMongoDB()

  const verified = verifyAccessToken()
  if (!verified.success) {
    return NextResponse.json({ success: false, error: 'token expired!' }, { status: 400 })
  }

  try {
    const body = await req.json()
    const { organization_id, c_createdBy, from, to, priority, status, page = 1, limit = 10 } = body

    // 🟢 STEP 1: Base query
    const matchQuery = {}
    if (organization_id) matchQuery.organization_id = organization_id

    if (Array.isArray(c_createdBy) && c_createdBy.length > 0) {
      matchQuery.c_createdBy = { $in: c_createdBy }
    } else if (c_createdBy) {
      matchQuery.c_createdBy = c_createdBy
    }

    // 🟢 STEP 2: Aggregation
    const pipeline = [
      { $match: matchQuery },
      { $unwind: '$values.Activity' },
      { $unwind: '$values.Activity.task' },

      // 🔥 Ensure dueDate is always a Date
      {
        $addFields: {
          'values.Activity.task.dueDate': {
            $cond: {
              if: { $eq: [{ $type: '$values.Activity.task.dueDate' }, 'date'] },
              then: '$values.Activity.task.dueDate',
              else: { $toDate: '$values.Activity.task.dueDate' }
            }
          }
        }
      },

      // Flatten structure
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              '$values.Activity.task',
              {
                organization_id: '$organization_id',
                lead_id: '$lead_id',
                lead_name: '$lead_name',
                form_name: '$form_name',
                c_createdBy: '$c_createdBy',
                'First Name': '$values.First Name',
                'Last Name': '$values.Last Name',
                'Company': '$values.Company',
                Phone: '$values.Phone'
              }
            ]
          }
        }
      }
    ]

    // 🟢 STEP 3: Filters
    const taskFilters = []
    if (priority) taskFilters.push({ priority })
    if (status) taskFilters.push({ status })
    if (from || to) {
      const dateFilter = {}
      if (from) {
        const start = new Date(from)
        start.setUTCHours(0, 0, 0, 0)
        dateFilter.$gte = start
      }
      if (to) {
        const end = new Date(to)
        end.setUTCHours(23, 59, 59, 999)
        dateFilter.$lte = end
      }
      taskFilters.push({ dueDate: dateFilter })
    }

    if (taskFilters.length > 0) {
      pipeline.push({ $match: { $and: taskFilters } })
    }

    // 🟢 STEP 4: Pagination + Sorting
    pipeline.push({ $sort: { dueDate: 1 } })
    pipeline.push({ $skip: (page - 1) * limit })
    pipeline.push({ $limit: limit })

    // 🟢 STEP 5: Execute main query
    const tasks = await Leadform.aggregate(pipeline)

    // 🟢 STEP 6: Count total (without skip/limit/sort)
    const countPipeline = pipeline.filter(stage => !('$skip' in stage || '$limit' in stage || '$sort' in stage))
    countPipeline.push({ $count: 'total' })
    const countResult = await Leadform.aggregate(countPipeline)
    const total = countResult[0]?.total || 0

    return NextResponse.json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: tasks
    })
  } catch (error) {
    console.error('⨯ Task list error:', error)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}

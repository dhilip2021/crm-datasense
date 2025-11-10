import { verifyAccessToken } from '@/helper/clientHelper'
import connectMongoDB from '@/libs/mongodb'
import Leadform from '@/models/Leadform'
import { UserRole } from '@/models/userRoleModel'
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
    const search = searchParams.get('search')?.trim() || ''
    const status = searchParams.get('status')?.trim() || ''
    const source = searchParams.get('source')?.trim() || ''
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    if (!organization_id || !form_name) {
      return NextResponse.json({ success: false, message: 'Missing organization_id or form_name' }, { status: 400 })
    }

    // 🔹 Base query

    let query = { organization_id, form_name }

    // 🟢 STEP 1: Find current user role
    const userRole = await UserRole.findOne({ c_role_id: verified.data.c_role_id }).lean()
    if (!userRole) {
      return NextResponse.json({ success: false, message: 'Invalid role' }, { status: 403 })
    }

    const currentPriority = userRole.c_role_priority

    // 🟢 STEP 2: Build base query

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

    // 🔹 Search filter (multiple fields)
    if (search) {
      query.$or = [
        { lead_id: { $regex: search, $options: 'i' } },
        { 'values.First Name': { $regex: search, $options: 'i' } },
        { 'values.Phone': { $regex: search, $options: 'i' } },
        { 'values.Email': { $regex: search, $options: 'i' } },
        { 'values.Company': { $regex: search, $options: 'i' } },
        { 'values.Industry': { $regex: search, $options: 'i' } },
        { 'values.City': { $regex: search, $options: 'i' } },
        { 'values.Job Title': { $regex: search, $options: 'i' } }
      ]
    }

   // 🔹 Filters
if (status) query['values.Lead Status'] = { $regex: status, $options: 'i' }

if (source) {
  query.$or = [
    { 'values.Lead Source': { $regex: source, $options: 'i' } },
    { 'values.Lead Status': { $regex: source, $options: 'i' } } // fallback
  ]
}

    // 🔹 Date Range Filter
    if (from || to) {
      query.submittedAt = {}
      if (from) query.submittedAt.$gte = new Date(from)
      if (to) query.submittedAt.$lte = new Date(to + 'T23:59:59')
    }

    // 🔹 Stats aggregation
    const statsPipeline = [
      { $match: query },
      {
        $group: {
          _id: null,
          totalLeads: { $sum: 1 },
          hotLeads: { $sum: { $cond: [{ $eq: ['$values.Label', 'Hot Lead'] }, 1, 0] } },
          warmLeads: { $sum: { $cond: [{ $eq: ['$values.Label', 'Warm Lead'] }, 1, 0] } },
          coldLeads: { $sum: { $cond: [{ $eq: ['$values.Label', 'Cold Lead'] }, 1, 0] } },
          newLeads: {
            $sum: {
              $cond: [{ $regexMatch: { input: '$values.Lead Status', regex: 'New', options: 'i' } }, 1, 0]
            }
          },
          contactedLeads: {
            $sum: {
              $cond: [{ $regexMatch: { input: '$values.Lead Status', regex: 'Contacted', options: 'i' } }, 1, 0]
            }
          },
          qualifiedLeads: {
            $sum: {
              $cond: [{ $regexMatch: { input: '$values.Lead Status', regex: 'Qualified', options: 'i' } }, 1, 0]
            }
          },
          proposalsentLeads: {
            $sum: {
              $cond: [{ $regexMatch: { input: '$values.Lead Status', regex: 'Proposal Sent', options: 'i' } }, 1, 0]
            }
          },
          negotiationLeads: {
            $sum: {
              $cond: [{ $regexMatch: { input: '$values.Lead Status', regex: 'Negotiation', options: 'i' } }, 1, 0]
            }
          },
          closedWonLeads: {
            $sum: {
              $cond: [{ $regexMatch: { input: '$values.Lead Status', regex: 'Closed Won', options: 'i' } }, 1, 0]
            }
          },
          closedLostLeads: {
            $sum: {
              $cond: [{ $regexMatch: { input: '$values.Lead Status', regex: 'Closed Lost', options: 'i' } }, 1, 0]
            }
          }
        }
      }
    ]

    // 🔹 Fetch data & stats in parallel (no pagination)
    const [data, statsResult] = await Promise.all([
      Leadform.find(query).sort({ createdAt: -1 }).lean(),
      Leadform.aggregate(statsPipeline)
    ])

    return NextResponse.json({
      success: true,
      total: data.length,
      stats: statsResult[0] || {
        totalLeads: 0,
        hotLeads: 0,
        warmLeads: 0,
        coldLeads: 0,
        newLeads: 0,
        contactedLeads: 0,
        qualifiedLeads: 0,
        proposalsentLeads: 0,
        negotiationLeads: 0,
        closedWonLeads: 0,
        closedLostLeads: 0
      },
      data
    })
  } catch (error) {
    console.error('⨯ Lead form list error:', error)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}

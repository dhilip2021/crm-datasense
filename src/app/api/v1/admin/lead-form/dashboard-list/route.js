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
      query.$or = [
        { lead_id: { $regex: search, $options: 'i' } },
        { 'values.First Name': { $regex: search, $options: 'i' } },
        { 'values.Phone': { $regex: search, $options: 'i' } },
        { 'values.Email': { $regex: search, $options: 'i' } },
        { 'values.Company': { $regex: search, $options: 'i' } },
        { 'values.Industry': { $regex: search, $options: 'i' } },
        { 'values.City': { $regex: search, $options: 'i' } },
        { 'values.Job Title': { $regex: search, $options: 'i' } },
      ]
    }

    if (status) {
      query['values.Lead Status'] = { $regex: status, $options: 'i' }
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


 
const [data, total, statsResult] = await Promise.all([
  Leadform.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('-__v')
    .lean(),

  Leadform.countDocuments(query),

  Leadform.aggregate([
    { $match: query }, // 🔥 filter ku same query use pannunga
    {
      $group: {
        _id: null,
        totalLeads: { $sum: 1 },
        hotLeads: { $sum: { $cond: [{ $eq: ["$values.Label", "Hot Lead"] }, 1, 0] } },
        warmLeads: { $sum: { $cond: [{ $eq: ["$values.Label", "Warm Lead"] }, 1, 0] } },
        coldLeads: { $sum: { $cond: [{ $eq: ["$values.Label", "Cold Lead"] }, 1, 0] } },
        newLeads: {
          $sum: {
            $cond: [
              { $regexMatch: { input: "$values.Lead Status", regex: "New", options: "i" } },
              1,
              0
            ]
          }
        },
        contactedLeads: {
          $sum: {
            $cond: [
              { $regexMatch: { input: "$values.Lead Status", regex: "Contacted", options: "i" } },
              1,
              0
            ]
          }
        },
        qualifiedLeads: {
          $sum: {
            $cond: [
              { $regexMatch: { input: "$values.Lead Status", regex: "Qualified", options: "i" } },
              1,
              0
            ]
          }
        },
        proposalsentLeads: {
          $sum: {
            $cond: [
              { $regexMatch: { input: "$values.Lead Status", regex: "Proposal Sent", options: "i" } },
              1,
              0
            ]
          }
        },
        negotiationLeads: {
          $sum: {
            $cond: [
              { $regexMatch: { input: "$values.Lead Status", regex: "Negotiation", options: "i" } },
              1,
              0
            ]
          }
        },
        closedWonLeads: {
          $sum: {
            $cond: [
              { $regexMatch: { input: "$values.Lead Status", regex: "Closed Won", options: "i" } },
              1,
              0
            ]
          }
        },
        closedLostLeads: {
          $sum: {
            $cond: [
              { $regexMatch: { input: "$values.Lead Status", regex: "Closed Lost", options: "i" } },
              1,
              0
            ]
          }
        }
      }
    }
  ])
])


return NextResponse.json({
  success: true,
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
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
    closedLostLeads: 0,
  },
  data
})


  } catch (error) {
    console.error('⨯ Lead form list error:', error)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}

import connectMongoDB from '@/libs/mongodb'
import Leadform from '@/models/Leadform'
import { NextResponse } from 'next/server'

export async function GET(req) {
  await connectMongoDB()

  try {
    const { searchParams } = new URL(req.url)
    const organization_id = searchParams.get('organization_id')
    const form_name = searchParams.get('form_name')
    const search = searchParams.get('search')?.trim() || ''
    const source = searchParams.get('source')?.trim() || ''
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    if (!organization_id || !form_name) {
      return NextResponse.json({ success: false, message: 'Missing organization_id or form_name' }, { status: 400 })
    }

    const query = { organization_id, form_name }

    // 🔍 Search filters
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

    if (source) query['values.Lead Source'] = { $regex: source, $options: 'i' }

    if (from || to) {
      query.submittedAt = {}
      if (from) query.submittedAt.$gte = new Date(from)
      if (to) query.submittedAt.$lte = new Date(to + 'T23:59:59')
    }

    // 🧩 Group by Lead Status and get only 3 recent leads per status
    const kanbanData = await Leadform.aggregate([
      { $match: query },
      { $sort: { createdAt: -1 } }, // latest leads first
      {
        $lookup: {
          from: 'ItemMasters',
          localField: 'items.item_ref.itemMasterRef',
          foreignField: '_id', // match ObjectId
          as: 'itemDetails'
        }
      },
      {
        $addFields: {
          items: {
            $map: {
              input: { $ifNull: ['$items', []] },
              as: 'order',
              in: {
                $mergeObjects: [
                  '$$order',
                  {
                    item_ref: {
                      $map: {
                        input: { $ifNull: ['$$order.item_ref', []] },
                        as: 'ref',
                        in: {
                          $mergeObjects: [
                            '$$ref',
                            {
                              $let: {
                                vars: {
                                  matched: {
                                    $first: {
                                      $filter: {
                                        input: '$itemDetails',
                                        as: 'd',
                                        cond: { $eq: ['$$d._id', '$$ref.itemMasterRef'] }
                                      }
                                    }
                                  }
                                },
                                in: {
                                  item_name: '$$matched.item_name',
                                  item_code: '$$matched.item_id'
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      },
      
      // 🔹 Lookup user info BEFORE grouping
  {
    $lookup: {
      from: 'users',
      localField: 'c_createdBy',
      foreignField: 'user_id',
      as: 'users'
    }
  },
  { $unwind: { path: '$users', preserveNullAndEmptyArrays: true } },

  // 🔹 Group by Lead Status
  {
    $group: {
      _id: '$values.Lead Status',
      leads: {
        $push: {
          _id: '$_id',
          lead_id: '$lead_id',
          lead_name: '$lead_name',
          lead_slug_name: '$lead_slug_name',
          lead_touch: '$lead_touch',
          lead_flag: '$lead_flag',
          values: '$values',
          submittedAt: '$submittedAt',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          c_createdBy: '$c_createdBy',
          user_name: '$users.user_name', // ✅ now this works
          items: '$items'
        }
      },
      totalCount: { $sum: 1 }
    }
  },
      {
        // ✅ Only take last 3 leads per status
        $project: {
          _id: 1,
          totalCount: 1,
          leads: { $slice: ['$leads', 0, 4] }
        }
      },
      { $sort: { _id: 1 } }
    ])

    const totalLeads = await Leadform.countDocuments(query)

    const kanban = kanbanData.map(item => ({
      status: item._id || 'Unassigned',
      totalCount: item.totalCount,
      leads: item.leads
    }))

    return NextResponse.json({
      success: true,
      totalLeads,
      totalStatuses: kanban.length,
      kanban
    })
  } catch (error) {
    console.error('⨯ Kanban Lead fetch error:', error)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}

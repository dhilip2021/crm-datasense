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
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '4', 10))
    const skip = (page - 1) * limit

    if (!organization_id || !form_name) {
      return NextResponse.json({ success: false, message: 'Missing organization_id or form_name' }, { status: 400 })
    }

    const query = { organization_id, form_name }

    // filters
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

    // Aggregation: attach item details, attach users (as array), convert users->user_name scalar,
    // group by status (count unique lead docs), then slice for pagination.
    const kanbanData = await Leadform.aggregate([
      { $match: query },
      { $sort: { createdAt: -1 } },

      // attach item master details
      {
        $lookup: {
          from: 'ItemMasters',
          localField: 'items.item_ref.itemMasterRef',
          foreignField: '_id',
          as: 'itemDetails'
        }
      },

      // merge itemDetails into items.item_ref (keeps structure; same as you had)
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

      // lookup users as array (do NOT unwind)
      {
        $lookup: {
          from: 'users',
          localField: 'c_createdBy',
          foreignField: 'user_id',
          as: 'users'
        }
      },

      // convert users array -> single scalar user_name (first match or null)
      {
        $addFields: {
          user_name: { $arrayElemAt: ['$users.user_name', 0] }
        }
      },

      // group by Lead Status and push full lead objects into an array "allLeads"
      {
        $group: {
          _id: '$values.Lead Status',
          allLeads: {
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
              user_name: '$user_name',
              items: '$items'
            }
          },
          totalCount: { $sum: 1 } // now counts each lead once (no unwind duplicates)
        }
      },

      // apply pagination slice on the grouped array
      {
        $project: {
          _id: 1,
          totalCount: 1,
          leads: { $slice: ['$allLeads', skip, limit] }
        }
      },

      { $sort: { _id: -1 } }
    ])

    const totalLeads = await Leadform.countDocuments(query)

    const kanban = kanbanData.map(item => ({
      status: item._id || 'Unassigned',
      totalCount: item.totalCount,
      page,
      limit,
      totalPages: Math.ceil(item.totalCount / limit),
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

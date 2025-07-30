import { NextResponse } from 'next/server'
import connectMongoDB from '@/libs/mongodb'
import { verifyAccessToken } from '@/helper/clientHelper'
import { Territory } from '@/models/territoryModel'

let sendResponse = {
  appStatusCode: '',
  message: '',
  payloadJson: [],
  error: ''
}


export async function GET(request) {
  const verified = verifyAccessToken()
  const searchParams = request.nextUrl.searchParams
  const is_group_param = searchParams.get('is_group')

  let sendResponse = {
    appStatusCode: '',
    message: '',
    payloadJson: [],
    error: ''
  }

  if (!verified.success) {
    sendResponse = {
      appStatusCode: 4,
      message: '',
      payloadJson: [],
      error: 'token expired!'
    }
    return NextResponse.json(sendResponse, { status: 400 })
  }

  try {
    await connectMongoDB()

    let matchFilter = { n_published: 1 }

    if (is_group_param === 'true') {
      matchFilter['is_group'] = true
    } else if (is_group_param === 'false') {
      matchFilter['is_group'] = false
    }

    const result = await Territory.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$_id',
          territory_id: { $first: '$territory_id' },
          territory_name: { $first: '$territory_name' },
          is_group: { $first: '$is_group' },
          parent_territory: { $first: '$parent_territory' },
          createdAt: { $first: '$createdAt' },
          c_createdBy: { $first: '$c_createdBy' },
          n_status: { $first: '$n_status' },
          n_published: { $first: '$n_published' }
        }
      },
      { $sort: { createdAt: 1 } }
    ])

    sendResponse = {
      appStatusCode: 0,
      message: result.length > 0 ? '' : 'No records found!',
      payloadJson: result,
      error: []
    }

    return NextResponse.json(sendResponse, { status: 200 })
  } catch (err) {
    sendResponse = {
      appStatusCode: 4,
      message: '',
      payloadJson: [],
      error: err.message
    }

    return NextResponse.json(sendResponse, { status: 400 })
  }
}

export async function POST(request) {
  const { n_limit, n_page, c_search_term } = await request.json()

  let searchTerm = c_search_term ? c_search_term : ''
  let n_limitTerm = n_limit
  let n_pageTerm = n_page === 1 ? 0 : (n_page - 1) * n_limit

  await connectMongoDB()

  let _search = {
    $and: [
      { n_published: 1 },
      ...(searchTerm ? [{ territory_name: { $regex: searchTerm, $options: 'i' } }] : [])
    ]
  }

  try {
    const result = await Territory.aggregate([
      { $match: _search },
      {
        $group: {
          _id: '$_id',
          territory_id: { $first: '$territory_id' },
          territory_name: { $first: '$territory_name' },
          is_group: { $first: '$is_group' },
          parent_territory: { $first: '$parent_territory' },
          createdAt: { $first: '$createdAt' },
          c_createdBy: { $first: '$c_createdBy' },
          n_status: { $first: '$n_status' },
          n_published: { $first: '$n_published' }
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          data: [{ $skip: n_pageTerm }, { $limit: n_limitTerm }],
          total_count: [{ $count: 'count' }]
        }
      }
    ])

    sendResponse = {
      appStatusCode: 0,
      message: '',
      payloadJson: result,
      error: []
    }
    return NextResponse.json(sendResponse, { status: 200 })
  } catch (err) {
    sendResponse = {
      appStatusCode: 4,
      message: '',
      payloadJson: [],
      error: err.message
    }
    return NextResponse.json(sendResponse, { status: 400 })
  }
}

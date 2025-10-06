import { NextResponse } from 'next/server'
import { verifyAccessToken } from '@/helper/clientHelper'
import connectMongoDB from '@/libs/mongodb'
import { ItemMaster } from '@/models/ItemMasterModel'

let sendResponse = {
  appStatusCode: '',
  message: '',
  payloadJson: [],
  error: ''
}

// ---------------- GET ----------------
export async function GET(request) {
  const id = request.nextUrl.searchParams.get('id')
  const verified = verifyAccessToken()

  await connectMongoDB()

  if (!verified.success) {
    sendResponse = {
      appStatusCode: 4,
      message: '',
      payloadJson: [],
      error: 'token expired!'
    }
    return NextResponse.json(sendResponse, { status: 400 })
  }

  const organizationId = verified?.data?.organization_id

  try {
    let _search
    if (id) {
      // check item exists
      const itemExists = await ItemMaster.findOne({ item_id: id })
      if (!itemExists) {
        return NextResponse.json(
          { appStatusCode: 4, message: '', payloadJson: [], error: 'Invalid Id!' },
          { status: 400 }
        )
      }

      _search = {
        $and: [{ n_status: 1 }, { n_published: 1 }, { item_id: id }, { organization_id: organizationId }]
      }
    } else {
      _search = {
        $and: [{ n_status: 'Active' }, { n_published: 1 }, { organization_id: organizationId }]
      }
    }

    const pipeline = [
      { $match: _search },
      {
        $group: {
           _id: '$_id',
          item_id: { $first: '$item_id' },
          item_type: { $first: '$item_type' },
          item_code: { $first: '$item_code' },
          item_name: { $first: '$item_name' },
          description: { $first: '$description' },
          uom: { $first: '$uom' },
          basePrice: { $first: '$basePrice' },
          gst: { $first: '$gst' },
          mrp: { $first: '$mrp' },
          distributorPrice: { $first: '$distributorPrice' },
          hsn: { $first: '$hsn' },
          licenseKey: { $first: '$licenseKey' },
          warrantyPeriod: { $first: '$warrantyPeriod' },
          warrantyPeriod: { $first: '$warrantyPeriod' },
          billingCycle: { $first: '$billingCycle' },
          subscriptionDuration: { $first: '$subscriptionDuration' },
          createdAt: { $first: '$createdAt' },
          c_createdBy: { $first: '$c_createdBy' },
          n_status: { $first: '$n_status' },
          n_published: { $first: '$n_published' }
        }
      },
      {
        $project: {
          _id: 1,
          item_id: 1,
          item_type: 1,
          item_code: 1,
          item_name: 1,
          description: 1,
          uom: 1,
          basePrice: 1,
          gst: 1,
          mrp: 1,
          distributorPrice: 1,
          hsn: 1,
          licenseKey: 1,
          warrantyPeriod: 1,
          warrantyPeriod: 1,
          billingCycle: 1,
          subscriptionDuration: 1,
          createdAt: 1,
          c_createdBy: 1,
          n_status: 1,
          n_published: 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]

    // if (!id) {
    //   pipeline.push(
    //     {
    //       $lookup: {
    //         from: 'users',
    //         localField: 'c_createdBy',
    //         foreignField: 'user_id',
    //         as: 'createdById'
    //       }
    //     },
    //     { $unwind: { path: '$createdById', preserveNullAndEmptyArrays: true } },
    //     { $addFields: { createdName: '$createdById.user_name' } }
    //   )
    // }

    const data = await ItemMaster.aggregate(pipeline)

    console.log(data,"<<< get item list")

    if (data.length > 0) {
      sendResponse = { appStatusCode: 0, message: '', payloadJson: data, error: [] }
    } else {
      sendResponse = { appStatusCode: 0, message: 'Record not found!!', payloadJson: [], error: [] }
    }

    return NextResponse.json(sendResponse, { status: 200 })
  } catch (err) {
    sendResponse = { appStatusCode: 4, message: '', payloadJson: [], error: err }
    return NextResponse.json(sendResponse, { status: 400 })
  }
}

// ---------------- POST ----------------
export async function POST(request) {
  const { n_limit, n_page, c_search_term } = await request.json()
  const verified = verifyAccessToken()

  if (!verified.success) {
    return NextResponse.json(
      { appStatusCode: 4, message: '', payloadJson: [], error: 'token expired!' },
      { status: 400 }
    )
  }

  const organizationId = verified?.data?.organization_id
  const searchTerm = c_search_term || ''
  const n_limitTerm = n_limit
  const n_pageTerm = n_page === 1 ? 0 : (n_page - 1) * n_limit

  try {
    await connectMongoDB()

    let _search
    if (searchTerm !== '') {
      _search = {
        n_published: 1,
        organization_id: organizationId,
        $expr: { $regexMatch: { input: { $toString: '$item_code' }, regex: searchTerm, options: 'i' } }
      }
    } else {
      _search = { $and: [{ n_published: 1 }, { organization_id: organizationId }] }
    }

    const data = await ItemMaster.aggregate([
      { $match: _search },
      {
        $group: {
          _id: '$_id',
          item_id: { $first: '$item_id' },
          item_type: { $first: '$item_type' },
          item_code: { $first: '$item_code' },
          item_name: { $first: '$item_name' },
          description: { $first: '$description' },
          uom: { $first: '$uom' },
          basePrice: { $first: '$basePrice' },
          gst: { $first: '$gst' },
          mrp: { $first: '$mrp' },
          distributorPrice: { $first: '$distributorPrice' },
          hsn: { $first: '$hsn' },
          licenseKey: { $first: '$licenseKey' },
          warrantyPeriod: { $first: '$warrantyPeriod' },
          warrantyPeriod: { $first: '$warrantyPeriod' },
          billingCycle: { $first: '$billingCycle' },
          subscriptionDuration: { $first: '$subscriptionDuration' },
          createdAt: { $first: '$createdAt' },
          c_createdBy: { $first: '$c_createdBy' },
          n_status: { $first: '$n_status' },
          n_published: { $first: '$n_published' }
        }
      },
      {
        $project: {
          _id: 1,
          item_id: 1,
          item_type: 1,
          item_code: 1,
          item_name: 1,
          description: 1,
          uom: 1,
          basePrice: 1,
          gst: 1,
          mrp: 1,
          distributorPrice: 1,
          hsn: 1,
          licenseKey: 1,
          warrantyPeriod: 1,
          warrantyPeriod: 1,
          billingCycle: 1,
          subscriptionDuration: 1,
          createdAt: 1,
          c_createdBy: 1,
          n_status: 1,
          n_published: 1
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

    if (data.length > 0) {
      sendResponse = { appStatusCode: 0, message: '', payloadJson: data, error: [] }
    } else {
      sendResponse = { appStatusCode: 0, message: 'Record not found!', payloadJson: [], error: [] }
    }

    return NextResponse.json(sendResponse, { status: 200 })
  } catch (err) {
    sendResponse = { appStatusCode: 4, message: '', payloadJson: [], error: err }
    return NextResponse.json(sendResponse, { status: 400 })
  }
}

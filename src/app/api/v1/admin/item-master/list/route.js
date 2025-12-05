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
  const type = request.nextUrl.searchParams.get('type')
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
        $and: [ { n_published: 1 }, { item_id: id }, { organization_id: organizationId }]
      }
    } else if (type) {
      // check item exists
      const itemExists = await ItemMaster.findOne({ item_type: type })
      if (!itemExists) {
        return NextResponse.json(
          { appStatusCode: 4, message: '', payloadJson: [], error: 'Invalid Id!' },
          { status: 400 }
        )
      }

      _search = {
        $and: [{ n_published: 1 }, { item_type: type }, { organization_id: organizationId }]
      }
    } else {
      _search = {
        $and: [{ n_published: 1 }, { organization_id: organizationId }]
      }
    }

    const pipeline = [
      { $match: _search },
      {
        $group: {
          _id: '$_id',
          item_id: { $first: '$item_id' },
          item_type: { $first: '$item_type' },
          product_code: { $first: '$product_code' },
          product_name: { $first: '$product_name' },
          product_category: { $first: '$product_category' },
          uom: { $first: '$uom' },
          basePrice: { $first: '$basePrice' },
          mrp: { $first: '$mrp' },
          gst: { $first: '$gst' },
          distributorPrice: { $first: '$distributorPrice' },
          stock: { $first: '$stock' },
          warranty_available: { $first: '$warranty_available' },
          product_status: { $first: '$product_status' },
          service_code: { $first: '$service_code' },
          service_name: { $first: '$service_name' },
          service_category: { $first: '$service_category' },
          service_type: { $first: '$service_type' },
          service_duration: { $first: '$service_duration' },
          service_charge: { $first: '$service_charge' },
          hsn: { $first: '$hsn' },
          selling_price: { $first: '$selling_price' },
          warranty_on_service: { $first: '$warranty_on_service' },
          service_status: { $first: '$service_status' },
          license_code: { $first: '$license_code' },
          license_name: { $first: '$license_name' },
          license_category: { $first: '$license_category' },
          license_key: { $first: '$license_key' },
          license_validity: { $first: '$license_validity' },
          license_price: { $first: '$license_price' },
          license_renewal_price: { $first: '$license_renewal_price' },
          no_of_users: { $first: '$no_of_users' },
          activation_type: { $first: '$activation_type' },
          subscription_included: { $first: '$subscription_included' },
          license_status: { $first: '$license_status' },
          warranty_code: { $first: '$warranty_code' },
          warranty_plan: { $first: '$warranty_plan' },
          warranty_covered_product: { $first: '$warranty_covered_product' },
          coverage_type: { $first: '$coverage_type' },
          warranty_duration: { $first: '$warranty_duration' },
          warranty_cost: { $first: '$warranty_cost' },
          warranty_provider: { $first: '$warranty_provider' },
          warranty_claim_limits: { $first: '$warranty_claim_limits' },
          warranty_expiry_date: { $first: '$warranty_expiry_date' },
          warranty_status: { $first: '$warranty_status' },
          subscription_code: { $first: '$subscription_code' },
          subscription_name: { $first: '$subscription_name' },
          plan_type: { $first: '$plan_type' },
          billing_cycle: { $first: '$billing_cycle' },
          subscription_price: { $first: '$subscription_price' },
          subscription_renewal_price: { $first: '$subscription_renewal_price' },
          auto_renewal_price: { $first: '$auto_renewal_price' },
          no_of_devices: { $first: '$no_of_devices' },
          subscription_start_date: { $first: '$subscription_start_date' },
          subscription_end_date: { $first: '$subscription_end_date' },
          subscription_status: { $first: '$subscription_status' },
          description: { $first: '$description' },
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
          product_code: 1,
          product_name: 1,
          product_category: 1,
          uom: 1,
          basePrice: 1,
          mrp: 1,
          gst: 1,
          distributorPrice: 1,
          stock: 1,
          warranty_available: 1,
          product_status: 1,
          service_code: 1,
          service_name: 1,
          service_category: 1,
          service_type: 1,
          service_duration: 1,
          service_charge: 1,
          hsn: 1,
          selling_price: 1,
          warranty_on_service: 1,
          service_status: 1,
          license_code: 1,
          license_name: 1,
          license_category: 1,
          license_key: 1,
          license_validity: 1,
          license_price: 1,
          license_renewal_price: 1,
          no_of_users: 1,
          activation_type: 1,
          subscription_included: 1,
          license_status: 1,
          warranty_code: 1,
          warranty_plan: 1,
          warranty_covered_product: 1,
          coverage_type: 1,
          warranty_duration: 1,
          warranty_cost: 1,
          warranty_provider: 1,
          warranty_claim_limits: 1,
          warranty_expiry_date: 1,
          warranty_status: 1,
          subscription_code: 1,
          subscription_name: 1,
          plan_type: 1,
          billing_cycle: 1,
          subscription_price: 1,
          subscription_renewal_price: 1,
          auto_renewal_price: 1,
          no_of_devices: 1,
          subscription_start_date: 1,
          subscription_end_date: 1,
          subscription_status: 1,
          description: 1,
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
        $expr: { $regexMatch: { input: { $toString: '$product_code' }, regex: searchTerm, options: 'i' } }
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
          product_code: { $first: '$product_code' },
          product_name: { $first: '$product_name' },
          product_category: { $first: '$product_category' },
          uom: { $first: '$uom' },
          basePrice: { $first: '$basePrice' },
          mrp: { $first: '$mrp' },
          gst: { $first: '$gst' },
          distributorPrice: { $first: '$distributorPrice' },
          stock: { $first: '$stock' },
          warranty_available: { $first: '$warranty_available' },
          product_status: { $first: '$product_status' },
          service_code: { $first: '$service_code' },
          service_name: { $first: '$service_name' },
          service_category: { $first: '$service_category' },
          service_type: { $first: '$service_type' },
          service_duration: { $first: '$service_duration' },
          service_charge: { $first: '$service_charge' },
          hsn: { $first: '$hsn' },
          selling_price: { $first: '$selling_price' },
          warranty_on_service: { $first: '$warranty_on_service' },
          service_status: { $first: '$service_status' },
          license_code: { $first: '$license_code' },
          license_name: { $first: '$license_name' },
          license_category: { $first: '$license_category' },
          license_key: { $first: '$license_key' },
          license_validity: { $first: '$license_validity' },
          license_price: { $first: '$license_price' },
          license_renewal_price: { $first: '$license_renewal_price' },
          no_of_users: { $first: '$no_of_users' },
          activation_type: { $first: '$activation_type' },
          subscription_included: { $first: '$subscription_included' },
          license_status: { $first: '$license_status' },
          warranty_code: { $first: '$warranty_code' },
          warranty_plan: { $first: '$warranty_plan' },
          warranty_covered_product: { $first: '$warranty_covered_product' },
          coverage_type: { $first: '$coverage_type' },
          warranty_duration: { $first: '$warranty_duration' },
          warranty_cost: { $first: '$warranty_cost' },
          warranty_provider: { $first: '$warranty_provider' },
          warranty_claim_limits: { $first: '$warranty_claim_limits' },
          warranty_expiry_date: { $first: '$warranty_expiry_date' },
          warranty_status: { $first: '$warranty_status' },
          subscription_code: { $first: '$subscription_code' },
          subscription_name: { $first: '$subscription_name' },
          plan_type: { $first: '$plan_type' },
          billing_cycle: { $first: '$billing_cycle' },
          subscription_price: { $first: '$subscription_price' },
          subscription_renewal_price: { $first: '$subscription_renewal_price' },
          auto_renewal_price: { $first: '$auto_renewal_price' },
          no_of_devices: { $first: '$no_of_devices' },
          subscription_start_date: { $first: '$subscription_start_date' },
          subscription_end_date: { $first: '$subscription_end_date' },
          subscription_status: { $first: '$subscription_status' },
          description: { $first: '$description' },
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
          product_code: 1,
          product_name: 1,
          product_category: 1,
          uom: 1,
          basePrice: 1,
          mrp: 1,
          gst: 1,
          distributorPrice: 1,
          stock: 1,
          warranty_available: 1,
          product_status: 1,
          service_code: 1,
          service_name: 1,
          service_category: 1,
          service_type: 1,
          service_duration: 1,
          service_charge: 1,
          hsn: 1,
          selling_price: 1,
          warranty_on_service: 1,
          service_status: 1,
          license_code: 1,
          license_name: 1,
          license_category: 1,
          license_key: 1,
          license_validity: 1,
          license_price: 1,
          license_renewal_price: 1,
          no_of_users: 1,
          activation_type: 1,
          subscription_included: 1,
          license_status: 1,
          warranty_code: 1,
          warranty_plan: 1,
          warranty_covered_product: 1,
          coverage_type: 1,
          warranty_duration: 1,
          warranty_cost: 1,
          warranty_provider: 1,
          warranty_claim_limits: 1,
          warranty_expiry_date: 1,
          warranty_status: 1,
          subscription_code: 1,
          subscription_name: 1,
          plan_type: 1,
          billing_cycle: 1,
          subscription_price: 1,
          subscription_renewal_price: 1,
          auto_renewal_price: 1,
          no_of_devices: 1,
          subscription_start_date: 1,
          subscription_end_date: 1,
          subscription_status: 1,
          description: 1,
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

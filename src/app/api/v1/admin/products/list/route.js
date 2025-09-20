// File: app/api/v1/admin/products/list/route.js

import { NextResponse } from 'next/server'
import connectMongoDB from '@/libs/mongodb'
import { verifyAccessToken } from '@/helper/clientHelper'
import { Product } from '@/models/Product'

let sendResponse = {
  success: '',
  appStatusCode: '',
  message: '',
  payloadJson: [],
  error: ''
}

// ✅ GET /api/v1/admin/products/list
export async function GET(req) {
  const verified = verifyAccessToken()

  if (verified.success) {
    try {
      await connectMongoDB()

      // fetch all products (only active ones if you want)
      const products = await Product.find({ status: 'Active', organization_id: verified.data.organization_id }).select('_id product_id code name category description basePrice discountType taxCategory status')

      sendResponse['success'] = true
      sendResponse['appStatusCode'] = 0
      sendResponse['message'] = ''
      sendResponse['payloadJson'] = products
      sendResponse['error'] = ''
      return NextResponse.json(sendResponse, { status: 200 })
    } catch (err) {
      sendResponse['success'] = false
      sendResponse['appStatusCode'] = 4
      sendResponse['message'] = ''
      sendResponse['payloadJson'] = ''
      sendResponse['error'] = err.message
      return NextResponse.json(sendResponse, { status: 500 })
    }
  } else {
    sendResponse['success'] = false
    sendResponse['appStatusCode'] = 4
    sendResponse['message'] = ''
    sendResponse['payloadJson'] = ''
    sendResponse['error'] = 'token expired!'

    return NextResponse.json(sendResponse, { status: 400 })
  }
}

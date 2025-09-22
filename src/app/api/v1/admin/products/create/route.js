import { NextResponse } from 'next/server'
import { create_UUID, verifyAccessToken } from '@/helper/clientHelper'
import connectMongoDB from '@/libs/mongodb'
import Product from '@/models/Product'
// import { Product } from '@/models/Product'

let sendResponse = {
  success: '',
  appStatusCode: '',
  message: '',
  payloadJson: [],
  error: ''
}

export async function POST(req) {
  const verified = verifyAccessToken()
  await connectMongoDB()

  if (verified.success) {
    try {
      const body = await req.json()

      const payload = {
        organization_id: verified.data.organization_id, // ✅ new field
        product_id: create_UUID(),
        code: body.code,
        name: body.name,
        category: body.category,
        industryTags: body.industryTags || [],
        subCategory: body.subCategory,
        description: body.description,
        uom: body.uom,
        basePrice: Number(body.basePrice), // store as number
        currency: body.currency,
        taxCategory: body.taxCategory,
        discountType: body.discountType,
        priceBooks: (body.priceBooks || []).map(pb => ({
          name: pb.name,
          price: Number(pb.price)
        })),
        status: body.status
      }

      const product = new Product(payload)
      await product.save()

      sendResponse['success'] = true
      sendResponse['appStatusCode'] = 0
      sendResponse['message'] = 'Product Created Successfuly!'
      sendResponse['payloadJson'] = product
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

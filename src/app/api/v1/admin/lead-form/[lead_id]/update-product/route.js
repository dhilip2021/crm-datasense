import connectMongoDB from '@/libs/mongodb'
import Leadform from '@/models/Leadform'
import { Product } from '@/models/Product'

export async function PUT(req, { params }) {
  await connectMongoDB()
  try {
    const { lead_id } = params
    const body = await req.json()

    console.log(body,"<<< edit productttt")

    const { product_id, quantity, unitPrice, discount } = body

    // 1. Find the lead
    const lead = await Leadform.findOne({ lead_id })
    if (!lead) {
      return Response.json({ success: false, message: 'Lead not found' }, { status: 404 })
    }

    // 2. Find the product inside lead.products
    const productIndex = lead.products.findIndex(p => p.product_id === product_id)
    if (productIndex === -1) {
      return Response.json({ success: false, message: 'Product not attached to lead' }, { status: 404 })
    }

    // 3. Get actual product details
    const product = await Product.findOne({ product_id })
    if (!product) {
      return Response.json({ success: false, message: 'Product not found' }, { status: 404 })
    }

    // 4. Update values
    const updatedUnitPrice = unitPrice || product.basePrice
    const updatedDiscount = discount || 0
    const updatedFinalPrice = quantity * updatedUnitPrice - (updatedDiscount / 100) * updatedUnitPrice

    lead.products[productIndex] = {
      ...lead.products[productIndex]._doc,
      quantity,
      unitPrice: updatedUnitPrice,
      discount: updatedDiscount,
      finalPrice: updatedFinalPrice
    }

    await lead.save()

    return Response.json({ success: true, lead })
  } catch (err) {
    return Response.json({ success: false, message: err.message }, { status: 400 })
  }
}

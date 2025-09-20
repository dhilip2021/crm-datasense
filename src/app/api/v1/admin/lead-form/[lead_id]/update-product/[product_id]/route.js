import connectMongoDB from '@/libs/mongodb'
import Leadform from '@/models/Leadform'
import { Product } from '@/models/Product'

export async function PUT(req, { params }) {
  await connectMongoDB()
  try {
    const { lead_id, product_id } = params

    console.log(lead_id,"<<<LEAD ID")
    console.log(product_id,"<<<PRODUCT ID")

    const body = await req.json()

    const { quantity, unitPrice, discount } = body

    // 1. Find lead
    const lead = await Leadform.findOne({ lead_id })
    if (!lead) {
      return Response.json({ success: false, message: 'Lead not found' }, { status: 404 })
    }

    // 2. Find product inside lead
    const productIndex = lead.products.findIndex(p => p._id.toString() === product_id)
    if (productIndex === -1) {
      return Response.json({ success: false, message: 'Product not attached to lead' }, { status: 404 })
    }

    // 3. Get product details using productRef (ObjectId)
    const productRefId = lead.products[productIndex].productRef
    const product = await Product.findById(productRefId)
    if (!product) {
      return Response.json({ success: false, message: 'Product not found in master list' }, { status: 404 })
    }

    // 4. Update fields
    const updatedUnitPrice = unitPrice || product.basePrice
    const updatedDiscount = discount || 0
    const updatedFinalPrice =
      quantity * updatedUnitPrice - (updatedDiscount / 100) * updatedUnitPrice

    lead.products[productIndex].quantity = quantity
    lead.products[productIndex].unitPrice = updatedUnitPrice
    lead.products[productIndex].discount = updatedDiscount
    lead.products[productIndex].finalPrice = updatedFinalPrice

    await lead.save()

    return Response.json({ success: true, lead })
  } catch (err) {
    return Response.json({ success: false, message: err.message }, { status: 400 })
  }
}

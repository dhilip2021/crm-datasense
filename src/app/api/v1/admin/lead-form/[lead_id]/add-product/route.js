import connectMongoDB from '@/libs/mongodb'
import Leadform from '@/models/Leadform'
import Product from '@/models/Product'
// import { Product } from '@/models/Product'

export async function POST(req, { params }) {
  await connectMongoDB()
  try {
    const { lead_id } = params
    const body = await req.json() // { products: [...] }

    const lead = await Leadform.findOne({ lead_id })
    if (!lead) return Response.json({ success: false, message: 'Lead not found' }, { status: 404 })

    for (const item of body.products) {
      const product = await Product.findOne({ product_id: item.product_id })
      if (!product) continue

      let finalPrice = (item.unitPrice || product.basePrice) * item.quantity
      if (product.discountType === 'Flat %') {
        finalPrice -= finalPrice * ((item.discount || 0) / 100)
      } else if (product.discountType === 'Flat Amount') {
        finalPrice -= item.discount || 0
      }

      lead.products.push({
        productRef: product._id,
        product_id: product.product_id,
        quantity: item.quantity,
        unitPrice: item.unitPrice || product.basePrice,
        discount: item.discount || 0,
        discountType: product.discountType,
        finalPrice
      })
    }

    await lead.save()
    return Response.json({ success: true, lead })
  } catch (err) {
    return Response.json({ success: false, message: err.message }, { status: 400 })
  }
}


import connectMongoDB from '@/libs/mongodb'
import Leadform from '@/models/Leadform'
import { Product } from '@/models/Product'

export async function POST(req, { params }) {
  await connectMongoDB()
  try {
    const { lead_id } = params

    console.log(lead_id, '<<< LEAD IDDDD')
    const body = await req.json()

    const lead = await Leadform.findOne({ lead_id })
    if (!lead) {
      return Response.json({ success: false, message: 'Lead not found' }, { status: 404 })
    }



    const product = await Product.findOne({ product_id: body.product_id })

    if (!product) {
      return Response.json({ success: false, message: 'Product not found' }, { status: 404 })
    }

    const finalPrice =
      body.quantity * (body.unitPrice || product.basePrice) - ((body.discount || 0) / 100) * body.unitPrice

    lead.products.push({
      productRef: product._id, // Mongo reference
      product_id: product.product_id, // Your custom code
      quantity: body.quantity,
      unitPrice: body.unitPrice || product.basePrice,
      discount: body.discount || 0,
      finalPrice
    })

    await lead.save()
    return Response.json({ success: true, lead })
  } catch (err) {
    return Response.json({ success: false, message: err.message }, { status: 400 })
  }
}

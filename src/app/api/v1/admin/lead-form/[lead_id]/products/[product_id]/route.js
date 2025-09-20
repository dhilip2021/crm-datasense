// File: app/api/v1/admin/lead-form/[lead_id]/products/[product_id]/route.js

import connectMongoDB from '@/libs/mongodb'
import Leadform from '@/models/Leadform'

export async function DELETE(req, { params }) {
  await connectMongoDB()
  try {
    const { lead_id, product_id } = params

    // 1. Find the lead
    const lead = await Leadform.findOne({ lead_id })
    if (!lead) {
      return Response.json({ success: false, message: 'Lead not found' }, { status: 404 })
    }

    // 2. Check product inside lead
    const productIndex = lead.products.findIndex(p => p._id.toString() === product_id)
    if (productIndex === -1) {
      return Response.json({ success: false, message: 'Product not found in this lead' }, { status: 404 })
    }

    // 3. Remove the product
    lead.products.splice(productIndex, 1)

    // 4. Save updated lead
    await lead.save()

    return Response.json({ success: true, message: 'Product removed successfully', lead })
  } catch (err) {
    return Response.json({ success: false, message: err.message }, { status: 400 })
  }
}

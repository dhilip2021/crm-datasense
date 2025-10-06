// File: app/api/v1/admin/lead-form/[leadId]/products/[productId]/route.js
import connectMongoDB from '@/libs/mongodb'
import Leadform from '@/models/Leadform'
import { NextResponse } from 'next/server'

export async function DELETE(req, { params }) {
  await connectMongoDB()

  try {
    const { leadId, productId } = params

    if (!leadId || !productId) {
      return NextResponse.json({ success: false, message: 'Missing parameters' }, { status: 400 })
    }

    const lead = await Leadform.findOne({ lead_id: leadId })
    if (!lead) {
      return NextResponse.json({ success: false, message: 'Lead not found' }, { status: 404 })
    }

    // 🔹 Remove the product from all orders
    let removed = false
    lead.items.forEach(order => {
      const initialLength = order.item_ref.length
      order.item_ref = order.item_ref.filter(item => item.item_id !== productId)
      if (order.item_ref.length < initialLength) removed = true
    })

    if (!removed) {
      return NextResponse.json({ success: false, message: 'Product not found in orders' }, { status: 404 })
    }

    await lead.save()
    return NextResponse.json({ success: true, message: 'Product removed successfully', lead })
  } catch (err) {
    console.error('Delete Product Error:', err)
    return NextResponse.json({ success: false, message: err.message }, { status: 500 })
  }
}

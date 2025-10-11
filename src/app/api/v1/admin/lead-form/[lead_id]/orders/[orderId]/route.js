import connectMongoDB from '@/libs/mongodb'
import Leadform from '@/models/Leadform'
import { NextResponse } from 'next/server'

export async function DELETE(req, { params }) {
  await connectMongoDB()
//   const { leadId, itemId } = params

  const { lead_id, itemId } = params   // ⚠️ Mismatch check
  console.log(params,"<<< PARAMSSSSS")

  if (!lead_id || !itemId) {
    return NextResponse.json({ success: false, message: 'Missing parameters' }, { status: 400 })
  }

  try {
    const lead = await Leadform.findOne({ lead_id: lead_id })
    if (!lead) return NextResponse.json({ success: false, message: 'Lead not found' }, { status: 404 })

    // 🔹 Remove the order from lead.items
    const initialLength = lead.items.length
    lead.items = lead.items.filter(o => o.item_id !== itemId)

    if (lead.items.length === initialLength) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 })
    }

    await lead.save()
    return NextResponse.json({ success: true, message: 'Order deleted successfully', lead })
  } catch (err) {
    console.error('Delete Order Error:', err)
    return NextResponse.json({ success: false, message: err.message }, { status: 500 })
  }
}

// File: app/api/v1/admin/lead-form/[lead_id]/update-product/[item_id]/route.js

import connectMongoDB from '@/libs/mongodb'
import Leadform from '@/models/Leadform'
import { ItemMaster } from '@/models/ItemMasterModel'
import { NextResponse } from 'next/server'
import mongoose from 'mongoose'

export async function PUT(req, { params }) {
  await connectMongoDB()
  try {
    const { lead_id, item_id } = params
    const body = await req.json()
    const { quantity, unitPrice, discount } = body

    // 1️⃣ Find the lead
    const lead = await Leadform.findOne({ lead_id })
    if (!lead) return NextResponse.json({ success: false, message: 'Lead not found' }, { status: 404 })

    // 2️⃣ Find the product inside items.item_ref
    let found = false
    for (let i = 0; i < lead.items.length; i++) {
      for (let j = 0; j < lead.items[i].item_ref.length; j++) {
        if (lead.items[i].item_ref[j]._id.toString() === item_id) {
          found = true
          const itemRef = lead.items[i].item_ref[j]

          // 3️⃣ Get master product data if needed
          const productMaster = await ItemMaster.findById(itemRef.itemMasterRef)
          const updatedUnitPrice = unitPrice || itemRef.unitPrice || productMaster?.mrp || 0
          const updatedDiscount = discount || itemRef.discount || 0
          const finalPrice =
            itemRef.discountType === 'Flat Amount'
              ? quantity * updatedUnitPrice - updatedDiscount
              : quantity * updatedUnitPrice - (updatedDiscount / 100) * (quantity * updatedUnitPrice)

          // 4️⃣ Update fields
          itemRef.quantity = quantity
          itemRef.unitPrice = updatedUnitPrice
          itemRef.discount = updatedDiscount
          itemRef.finalPrice = finalPrice

          break
        }
      }
      if (found) break
    }

    if (!found) return NextResponse.json({ success: false, message: 'Product not attached to lead' }, { status: 404 })

    await lead.save()

    return NextResponse.json({ success: true, lead })
  } catch (err) {
    console.error('Update Product Error:', err)
    return NextResponse.json({ success: false, message: err.message }, { status: 400 })
  }
}

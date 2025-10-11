import connectMongoDB from '@/libs/mongodb'
import Leadform from '@/models/Leadform'
import { NextResponse } from 'next/server'


// export async function PUT(req, { params }) {
//   await connectMongoDB()

//   try {
//     const { lead_id } = params
//     const body = await req.json()
//     const { item_id, items } = body

//     if (!item_id) {
//       return NextResponse.json({ success: false, message: 'item_id required' }, { status: 400 })
//     }

//     if (!items || !Array.isArray(items) || items.length === 0) {
//       return NextResponse.json({ success: false, message: 'No items provided' }, { status: 400 })
//     }

//     // 1️⃣ Find the lead
//     const lead = await Leadform.findOne({ lead_id })
//     if (!lead) {
//       return NextResponse.json({ success: false, message: 'Lead not found' }, { status: 404 })
//     }

//     // 2️⃣ Find the particular order
//     const order = lead.items.find(o => o.item_id === item_id)
//     if (!order) {
//       return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 })
//     }

//     // 3️⃣ Update only items inside that order
//     items.forEach(updateItem => {
//       order.item_ref.forEach(itemRef => {
//         if (itemRef.item_id === updateItem.item_id) {
//           const updatedUnitPrice = updateItem.unitPrice ?? itemRef.unitPrice
//           const updatedDiscount = updateItem.discount ?? itemRef.discount
//           const updatedQuantity = updateItem.quantity ?? itemRef.quantity
//           const discountType = updateItem.discountType ?? itemRef.discountType

//           const finalPrice =
//             discountType === 'Flat Amount'
//               ? updatedQuantity * updatedUnitPrice - updatedDiscount
//               : updatedQuantity * updatedUnitPrice - (updatedDiscount / 100) * (updatedQuantity * updatedUnitPrice)

//           itemRef.quantity = updatedQuantity
//           itemRef.unitPrice = updatedUnitPrice
//           itemRef.discount = updatedDiscount
//           itemRef.finalPrice = finalPrice
//           itemRef.discountType = discountType

//           if (updateItem.itemMasterRef?._id) {
//             itemRef.itemMasterRef = updateItem.itemMasterRef._id
//           }
//         }
//       })
//     })

//     // 4️⃣ Save lead
//     await lead.save()

//     return NextResponse.json({ success: true, lead })
//   } catch (err) {
//     console.error('Bulk Update Products Error:', err)
//     return NextResponse.json({ success: false, message: err.message }, { status: 400 })
//   }
// }


export async function PUT(req, { params }) {
  await connectMongoDB()

  try {
    const { lead_id } = params
    const body = await req.json()
    const { item_id, items } = body

    if (!item_id) {
      return NextResponse.json({ success: false, message: 'item_id required' }, { status: 400 })
    }

    // 1️⃣ Find the lead
    const lead = await Leadform.findOne({ lead_id })
    if (!lead) {
      return NextResponse.json({ success: false, message: 'Lead not found' }, { status: 404 })
    }

    // 2️⃣ Find the particular order
    const order = lead.items.find(o => o.item_id === item_id)
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 })
    }

    // 3️⃣ Replace items inside that order
    order.item_ref = items.map(updateItem => {
      const qty = updateItem.quantity ?? 0
      const unitPrice = updateItem.unitPrice ?? 0
      const discount = updateItem.discount ?? 0
      const discountType = updateItem.discountType ?? 'Flat %'

      const finalPrice =
        discountType === 'Flat Amount'
          ? qty * unitPrice - discount
          : qty * unitPrice - (discount / 100) * (qty * unitPrice)

      return {
        item_id: updateItem.item_id,
        quantity: qty,
        unitPrice,
        discount,
        discountType,
        finalPrice,
        itemMasterRef: updateItem.itemMasterRef?._id || updateItem.itemMasterRef
      }
    })

    // 4️⃣ Save lead
    await lead.save()

    return NextResponse.json({ success: true, lead })
  } catch (err) {
    console.error('Bulk Update Products Error:', err)
    return NextResponse.json({ success: false, message: err.message }, { status: 400 })
  }
}
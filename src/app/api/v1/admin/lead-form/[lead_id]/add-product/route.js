import connectMongoDB from '@/libs/mongodb'
import { ItemMaster } from '@/models/ItemMasterModel'
import Leadform from '@/models/Leadform'

// export async function POST(req, { params }) {
//   await connectMongoDB()
//   try {
//     const { lead_id } = params
//     const body = await req.json() // { items: [...] }

//     const lead = await Leadform.findOne({ lead_id })
//     if (!lead) {
//       return Response.json({ success: false, message: 'Lead not found' }, { status: 404 })
//     }

//     // 🔹 Loop over each order in payload
//     for (const order of body.items) {
//       const item_id = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`

//       const orderObject = {
//         item_id,
//         item_ref: []
//       }

//       // 🔹 Loop inside item_ref
//       for (const item of order.item_ref) {
//         const itemData = await ItemMaster.findOne({ item_id: item.item_id })
//         if (!itemData) continue

//         let finalPrice = (item.unitPrice || itemData.basePrice) * item.quantity

//         // 🔹 Discount apply
//         if (item.discountType === 'Flat %') {
//           finalPrice -= finalPrice * ((item.discount || 0) / 100)
//         } else if (item.discountType === 'Flat Amount') {
//           finalPrice -= item.discount || 0
//         }

//         orderObject.item_ref.push({
//           itemMasterRef: itemData._id,
//           item_id: itemData.item_id,
//           quantity: item.quantity,
//           unitPrice: item.unitPrice || itemData.basePrice,
//           discount: item.discount || 0,
//           discountType: item.discountType || itemData.discountType,
//           finalPrice
//         })
//       }

//       // 🔹 Save order into lead
//       lead.items.push(orderObject)
//     }

//     await lead.save()

//     return Response.json({ success: true, lead })
//   } catch (err) {
//     return Response.json({ success: false, message: err.message }, { status: 400 })
//   }
// }



export async function POST(req, { params }) {
  await connectMongoDB()
  try {
    const { lead_id } = params
    const body = await req.json() // { items: [ { item_ref: [...] }, { item_ref: [...] } ] }

    const lead = await Leadform.findOne({ lead_id })
    if (!lead) {
      return Response.json({ success: false, message: 'Lead not found' }, { status: 404 })
    }

    // 🔹 Generate one single item_id
    const item_id = `ITEM-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    const orderObject = {
      item_id,
      item_ref: []
    }

    // 🔹 Flatten all item_ref from payload
    for (const order of body.items) {
      if (order.item_ref && Array.isArray(order.item_ref)) {
        for (const item of order.item_ref) {
          // optional: verify from ItemMaster
          const itemData = await ItemMaster.findOne({ item_id: item.item_id })
          if (!itemData) continue

          // recalc finalPrice if needed
          let finalPrice = (item.unitPrice || itemData.basePrice) * item.quantity
          if (item.discountType === 'Flat %') {
            finalPrice -= finalPrice * ((item.discount || 0) / 100)
          } else if (item.discountType === 'Flat Amount') {
            finalPrice -= item.discount || 0
          }

          orderObject.item_ref.push({
            itemMasterRef: itemData._id,
            item_id: item.item_id,
            item_name: item.item_name,
            item_type: item.item_type,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount || 0,
            discountType: item.discountType,
            finalPrice,
            uom: item.uom,
            gst: item.gst,
            hsn: item.hsn
          })
        }
      }
    }

    // 🔹 Save only one order with all items
    lead.items.push(orderObject)
    await lead.save()

    return Response.json({ success: true, lead })
  } catch (err) {
    console.error('Save error:', err)
    return Response.json({ success: false, message: err.message }, { status: 400 })
  }
}

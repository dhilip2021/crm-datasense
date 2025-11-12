import { NextResponse } from 'next/server'
import connectMongoDB from '@/libs/mongodb'
import { OpportunityReason } from '@/models/OpportunityReason'
import { verifyAccessToken } from '@/helper/clientHelper'

// ✅ GET: Fetch reasons by organization_id
export async function GET(request) {
  const verified = verifyAccessToken()
  if (!verified.success) {
    return NextResponse.json({ success: false, error: 'token expired!' }, { status: 400 })
  }

  const { searchParams } = new URL(request.url)
  const organization_id = searchParams.get('organization_id')

  if (!organization_id) {
    return NextResponse.json({ success: false, error: 'organization_id required' }, { status: 400 })
  }

  try {
    await connectMongoDB()

    const data = await OpportunityReason.findOne({ organization_id })
    if (!data) {
      return NextResponse.json({ winReasons: [], lossReasons: [] }, { status: 200 })
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error) {
    console.error('GET Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch opportunity reasons' }, { status: 500 })
  }
}

// ✅ POST: Create or replace entire reason list
export async function POST(request) {
  const verified = verifyAccessToken()
  if (!verified.success) {
    return NextResponse.json({ success: false, error: 'token expired!' }, { status: 400 })
  }

  try {
    await connectMongoDB()
    const { organization_id, winReasons = [], lossReasons = [] } = await request.json()

    if (!organization_id) {
      return NextResponse.json({ success: false, error: 'organization_id required' }, { status: 400 })
    }

    let record = await OpportunityReason.findOne({ organization_id })

    if (record) {
      record.winReasons = Array.from(new Set([...(record.winReasons || []), ...winReasons]))
      record.lossReasons = Array.from(new Set([...(record.lossReasons || []), ...lossReasons]))
      await record.save()
    } else {
      record = await OpportunityReason.create({
        organization_id,
        winReasons: Array.from(new Set(winReasons)),
        lossReasons: Array.from(new Set(lossReasons)),
        c_createdBy: verified.data.user_id
      })
    }

    return NextResponse.json({ success: true, message: 'Reasons saved successfully', data: record }, { status: 200 })
  } catch (error) {
    console.error('POST Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to save opportunity reasons' }, { status: 500 })
  }
}

// ✅ PUT: Add/Edit/Remove a single reason
export async function PUT(request) {
  const verified = verifyAccessToken()
  if (!verified.success) {
    return NextResponse.json({ success: false, error: 'token expired!' }, { status: 400 })
  }

  try {
    await connectMongoDB()
    const { organization_id, type, action, value, oldValue } = await request.json()

    if (!organization_id || !type || !action) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    let record = await OpportunityReason.findOne({ organization_id })
    if (!record) {
      record = await OpportunityReason.create({
        organization_id,
        winReasons: [],
        lossReasons: [],
        c_updatedBy: verified.data.user_id
      })
    }

    // 🔹 Handle WIN reasons
    if (type === 'win') {
      const list = new Set(record.winReasons)

      if (action === 'add') {
        if (!list.has(value)) list.add(value)
      } else if (action === 'edit') {
        record.winReasons = record.winReasons.map(r => (r === oldValue ? value : r))
      } else if (action === 'remove') {
        record.winReasons = record.winReasons.filter(r => r !== value)
      }

      if (action === 'add') record.winReasons = [...list]
    }

    // 🔹 Handle LOSS reasons
    if (type === 'loss') {
      const list = new Set(record.lossReasons)

      if (action === 'add') {
        if (!list.has(value)) list.add(value)
      } else if (action === 'edit') {
        record.lossReasons = record.lossReasons.map(r => (r === oldValue ? value : r))
      } else if (action === 'remove') {
        record.lossReasons = record.lossReasons.filter(r => r !== value)
      }

      if (action === 'add') record.lossReasons = [...list]
    }

    await record.save()

    return NextResponse.json({ success: true, message: 'Reason updated successfully', data: record }, { status: 200 })
  } catch (error) {
    console.error('PUT Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update reason' }, { status: 500 })
  }
}

// ✅ DELETE: Remove reasons by type or all
export async function DELETE(request) {
  const verified = verifyAccessToken()
  if (!verified.success) {
    return NextResponse.json({ success: false, error: 'token expired!' }, { status: 400 })
  }

  try {
    await connectMongoDB()
    const { organization_id, type } = await request.json() // type: "win", "loss", "all"

    if (!organization_id) {
      return NextResponse.json({ success: false, error: 'organization_id required' }, { status: 400 })
    }

    const record = await OpportunityReason.findOne({ organization_id })
    if (!record) {
      return NextResponse.json({ success: false, message: 'No records found to delete' }, { status: 404 })
    }

    if (type === 'win') record.winReasons = []
    else if (type === 'loss') record.lossReasons = []
    else if (type === 'all') {
      record.winReasons = []
      record.lossReasons = []
    }

    await record.save()

    return NextResponse.json({ success: true, message: `Deleted ${type || 'all'} reasons`, data: record }, { status: 200 })
  } catch (error) {
    console.error('DELETE Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete opportunity reasons' }, { status: 500 })
  }
}


// ✅ PUT (add)
// {
//   "organization_id": "a420ed6cacae",
//   "type": "loss",
//   "action": "add",
//   "value": "Wrong Contact Details"
// }


// ✅ PUT (edit)
// {
//   "organization_id": "a420ed6cacae",
//   "type": "win",
//   "action": "edit",
//   "oldValue": "Feature Fit",
//   "value": "Product Fit"
// }

// ✅ PUT (remove)
// {
//   "organization_id": "a420ed6cacae",
//   "type": "loss",
//   "action": "remove",
//   "value": "Budget Constraints"
// }

// ✅ DELETE (clear all)
// {
//   "organization_id": "a420ed6cacae",
//   "type": "all"
// }



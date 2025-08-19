import { NextResponse } from 'next/server'
import connectMongoDB from '@/libs/mongodb'
import CampaignType from '@/models/campaignType'
// import { create_UUID } from "@/helper/clientHelper";

// GET all campaign types
// export async function GET() {
//   await connectMongoDB();
//   try {
//     const campaignTypes = await CampaignType.find({});
//     return NextResponse.json({ success: true, data: campaignTypes });
//   } catch (error) {
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }

export async function GET(req) {
  await connectMongoDB()
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const skip = (page - 1) * limit

    // Count total documents
    const total = await CampaignType.countDocuments()

    // Paginated query
    const campaignTypes = await CampaignType.find({}).skip(skip).limit(limit).sort({ createdAt: 1 })

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      page,
      limit,
      total,
      totalPages,
      data: campaignTypes
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST new campaign type
export async function POST(req) {
  await connectMongoDB()
  try {
    const body = await req.json()
    const { organization_id, campaign_name, description } = body

    const lastCampaign = await CampaignType.findOne({}).sort({ campaign_type_id: -1 }).lean()

    const lastId = lastCampaign ? lastCampaign.campaign_type_id : 0

    const newCampaignType = await CampaignType.create({
      organization_id,
      campaign_type_id: lastId + 1,
      campaign_name,
      description
    })

    return NextResponse.json({ success: true, data: newCampaignType }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

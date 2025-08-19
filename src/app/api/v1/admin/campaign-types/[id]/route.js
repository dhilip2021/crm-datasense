import { NextResponse } from "next/server";
import connectMongoDB from "@/libs/mongodb";
import CampaignType from "@/models/campaignType";

// GET single campaign type
export async function GET(req, { params }) {
  await connectMongoDB();
  try {
    const { id } = params;
    const campaignType = await CampaignType.findById(id);
    if (!campaignType) {
      return NextResponse.json({ success: false, message: "Not Found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: campaignType });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT update
export async function PUT(req, { params }) {
  await connectMongoDB();
  try {
    const { id } = params;
    const body = await req.json();
    const updated = await CampaignType.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE
export async function DELETE(req, { params }) {
  await connectMongoDB();
  try {
    const { id } = params;
    await CampaignType.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

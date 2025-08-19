import { NextResponse } from "next/server";
import connectMongoDB from "@/libs/mongodb";
import Customers from "@/models/customersModel";

// GET single customer
export async function GET(req, { params }) {
  await connectMongoDB();
  try {
    const customer = await Customers.findById(params.id);
    if (!customer) {
      return NextResponse.json({ success: false, message: "Customer Not Found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT update customer
export async function PUT(req, { params }) {
  await connectMongoDB();
  try {
    const body = await req.json();
    const updated = await Customers.findByIdAndUpdate(params.id, body, { new: true });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE customer
export async function DELETE(req, { params }) {
  await connectMongoDB();
  try {
    await Customers.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: "Customer Deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

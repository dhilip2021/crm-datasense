import { NextResponse } from "next/server";
import connectMongoDB from "@/libs/mongodb";
import Customers from "@/models/customersModel";
// import Customer from "@/models/Customer";

// GET Customers (with pagination)
export async function GET(req) {
  await connectMongoDB();
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const total = await Customers.countDocuments();
    const customers = await Customers.find({})
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      page,
      limit,
      total,
      totalPages,
      data: customers,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST New Customer
export async function POST(req) {
  await connectMongoDB();
  try {
    const body = await req.json();
    const newCustomer = await Customers.create(body);

    return NextResponse.json({ success: true, data: newCustomer }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

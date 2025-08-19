import { NextResponse } from "next/server";
import connectMongoDB from "@/libs/mongodb";
import * as XLSX from "xlsx";
import Customerform from "@/models/Customerform";

export async function POST(req) {
  await connectMongoDB();

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const organization_id = formData.get("organization_id");

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let batch = [];
    let savedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < sheetData.length; i++) {
      const row = sheetData[i];

      // 🔍 Duplicate check (customer_id / email / phone)
      const existingCustomer = await Customerform.findOne({
        $or: [
          { customer_id: row["Customer ID"] },
          { email: row["Email"] },
          { phone: row["Phone"] },
        ],
      }).lean();

      if (existingCustomer) {
        skippedCount++;
        continue;
      }

      // 🆕 Prepare new customer
      const customerData = {
        organization_id,
        auto_inc_id: String(i + 1).padStart(5, "0"),
        customer_id: row["Customer ID"] || `CUST-${String(i + 1).padStart(5, "0")}`,
        first_name: row["First Name"] || "",
        last_name: row["Last Name"] || "",
        customer_name: `${row["First Name"] || ""} ${row["Last Name"] || ""}`.trim(),
        email: row["Email"] || "",
        phone: row["Phone"] || "",
        company: row["Company"] || "",
        industry: row["Industry"] || "",
        status: row["Status"] || "Active",
        lead_source: row["Lead Source"] || "",
        created_at: row["Created Date"] ? new Date(row["Created Date"]) : new Date(),
        updatedAt: row["Last Contact Date"] ? new Date(row["Last Contact Date"]) : new Date(),
      };

      batch.push(customerData);

      // 🚀 Bulk insert in chunks of 1000
      if (batch.length === 1000) {
        const inserted = await Customerform.insertMany(batch);
        savedCount += inserted.length;
        batch = [];
      }
    }

    // Insert remaining
    if (batch.length > 0) {
      const inserted = await Customerform.insertMany(batch);
      savedCount += inserted.length;
    }

    return NextResponse.json({
      success: true,
      imported: savedCount,
      skipped: skippedCount,
      message: `${savedCount} customers imported, ${skippedCount} duplicates skipped`,
    });
  } catch (error) {
    console.error("Import Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

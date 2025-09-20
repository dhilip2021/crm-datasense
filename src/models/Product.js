import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    organization_id: { type: String, required: true },
    code: { type: String, required: true },
    product_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["Product", "Service", "Subscription", "License"],
      required: true,
    },
    industryTags: [{ type: String }],
    subCategory: { type: String },
    description: { type: String },
    uom: { type: String },
    basePrice: { type: Number },
    currency: { type: String, default: "INR" },
    taxCategory: { type: String },
    discountType: { type: String },
    priceBooks: [
      {
        name: String,
        price: Number,
      },
    ],
    sku: { type: String },
    stockQty: { type: Number, default: 0 },
    warehouse: { type: String },
    reorderLevel: { type: Number },
    batchNo: { type: String },
    expiryDate: { type: Date },
    duration: { type: String },
    recurring: { type: Boolean, default: false },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

// ✅ Fix OverwriteModelError
export const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema, 'products')

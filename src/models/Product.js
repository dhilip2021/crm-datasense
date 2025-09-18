import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    organization_id: {type: String, required: true},
    code: { type: String, required: true,  }, // SKU / ID
    product_id: { type: String, required: true, unique: true }, // SKU / ID
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["Product", "Service", "Subscription", "License"],
      required: true,
    },
    industryTags: [{ type: String }], // FMCG, Pharma, IT, etc.
    subCategory: { type: String },
    description: { type: String },

    // Commercial
    uom: { type: String }, // Unit, Kg, Month/User
    basePrice: { type: Number },
    currency: { type: String, default: "INR" },
    taxCategory: { type: String }, // GST %, VAT %, No Tax
    discountType: { type: String }, // Flat %, Slab, Role-based
    priceBooks: [
      {
        name: String, // Enterprise, SMB
        price: Number,
      },
    ],

    // Inventory
    sku: { type: String },
    stockQty: { type: Number, default: 0 },
    warehouse: { type: String },
    reorderLevel: { type: Number },
    batchNo: { type: String },
    expiryDate: { type: Date },

    // Service/Subscription
    duration: { type: String }, // 6 months, 1 year
    recurring: { type: Boolean, default: false },

    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);

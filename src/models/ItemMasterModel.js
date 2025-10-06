import mongoose from 'mongoose'

const ItemMasterSchema = new mongoose.Schema(
  {
    organization_id: { type: String, required: true },
    item_id: { type: String, required: true, unique: true },
    // 🔹 General Details
    item_type: {
      type: String,
      enum: ['Product', 'Service', 'License', 'Warranty', 'Subscription'],
      required: true
    },
    // Common fields
    item_name: { type: String, required: true, trim: true },
    item_code: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    uom: {type: String, required: true },
    basePrice: { type: Number, required: true, min: 0 },
    gst: { type: String },
    // Product-specific
    mrp: { type: Number },
    distributorPrice: { type: Number },
    // Service-specific
    hsn: { type: String }, // SAC/HSN Code
    // License-specific
    licenseKey: { type: String },
    // Warranty-specific
    warrantyPeriod: { type: Number }, // months
    // Subscription-specific
    billingCycle: { type: String }, // Monthly / Yearly
    subscriptionDuration: { type: String }, // e.g. 12 Months
    // currency: { type: String, default: "INR" },
    n_status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active'
    },
    n_published: {
      type: Number,
      required: true,
      enum: [0, 1],
      default: 1
    },
    c_createdBy: {
      type: String
    },
    updatedBy: {
      type: String
    }
  },
  { timestamps: true }
)

export const ItemMaster = mongoose.models.ItemMaster || mongoose.model('ItemMaster', ItemMasterSchema, 'ItemMasters')

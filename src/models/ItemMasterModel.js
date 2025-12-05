import mongoose from 'mongoose'

const ItemMasterSchema = new mongoose.Schema(
  {
    organization_id: { type: String, required: true },
    item_id: { type: String, required: true, unique: true },
    item_type: {
      type: String,
      enum: ['Product', 'Service', 'License', 'Warranty', 'Subscription'],
      required: true
    },
    // Product-specific
    product_code: { type: String, trim: true },
    product_name: { type: String, trim: true },
    product_category: { type: String, trim: true },
    basePrice: { type: Number, min: 0 },
    mrp: { type: Number },
    distributorPrice: { type: Number },
    stock: { type: String },
    warranty_available: {
      type: String,
      enum: ['Yes', 'No'],
      default: 'Yes'
    },
    product_status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active'
    },

    // Service-specific
    service_code: { type: String, trim: true },
    service_name: { type: String, trim: true },
    service_category: { type: String, trim: true },
    service_type: {
      type: String,
      enum: ['On-site', 'Remote'],
      default: 'On-site'
    },
    service_duration: { type: String, trim: true },
    service_charge: { type: String, trim: true },
    
    selling_price: { type: String, trim: true },
    warranty_on_service: { type: String, trim: true },
    service_status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active'
    },

    // License-specific
    license_code: { type: String, trim: true },
    license_name: { type: String, trim: true },
    license_category: { type: String, trim: true },
    license_key: { type: String, trim: true },
    license_validity: { type: String, trim: true },
    license_price: { type: String, trim: true },
    license_renewal_price: { type: String, trim: true },
    no_of_users: { type: String, trim: true },
    activation_type: { type: String, trim: true },
    subscription_included: {
      type: String,
      enum: ['Yes', 'No'],
      default: 'Yes'
    },
    license_status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active'
    },


    // Waranty-specific
    warranty_code: { type: String, trim: true },
    warranty_plan: { type: String, trim: true },
    warranty_covered_product: { type: String, trim: true },
    coverage_type: { type: String, trim: true },
    warranty_duration: { type: String, trim: true },
    warranty_cost: { type: String, trim: true },
    warranty_provider: { type: String, trim: true },
    warranty_claim_limits: { type: String, trim: true },
    warranty_expiry_date: { type: String, trim: true },
    warranty_status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active'
    },

    
    // Waranty-specific
    subscription_code: { type: String, trim: true },
    subscription_name: { type: String, trim: true },
    plan_type: { type: String, trim: true },
    billing_cycle: { type: String, trim: true },
    subscription_price: { type: String, trim: true },
    subscription_renewal_price: { type: String, trim: true },
    auto_renewal_price: { type: String, trim: true },
    no_of_devices: { type: String, trim: true },
    subscription_start_date: { type: String, trim: true },
    subscription_end_date: { type: String, trim: true },
    subscription_status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active'
    },
    
    // Common fields
    hsn: { type: String }, 
    gst: { type: String },
    description: { type: String, default: '' },
    uom: { type: String},

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
    c_updatedBy: {
      type: String
    },
     c_deletedBy: {
      type: String
    }
  },
  { timestamps: true }
)

export const ItemMaster = mongoose.models.ItemMaster || mongoose.model('ItemMaster', ItemMasterSchema, 'ItemMasters')

const mongoose = require('mongoose')

var Schema = mongoose.Schema

const CustomerSchema = new Schema(
  {
    customer_id: {
      type: String,
      required: [true, 'Cutomer Id is required!'],
      trim: true
    },
    customer_name: {
      type: String,
      required: [true, 'Cutomer Name is required!'],
      trim: true
    },
    customer_type: {
      type: String,
      required: [true, 'Cutomer type is required!'],
      trim: true
    },
    salutation: {
      type: String,
      trim: true
    },
    gender: {
      type: String,
      trim: true
    },
    territory_id: {
      type: String,
      trim: true
    },
    lead_id: {
      type: String,
      trim: true
    },
    opportunity_id: {
      type: String,
      trim: true
    },
    prospect_id: {
      type: String,
      trim: true
    },
    account_manager_id: {
      type: String,
      trim: true
    },
    billing_currency_id: {
      type: String,
      trim: true
    },
    price_list_id: {
      type: String,
      trim: true
    },
    bank_account_id: {
      type: String,
      trim: true
    },
    c_createdBy: {
      type: String
    },
    c_updatedBy: {
      type: String
    },
    c_deletedBy: {
      type: String
    },
    n_status: {
      type: Number,
      required: true,
      enum: [0, 1],
      default: 1
    },
    n_published: {
      type: Number,
      required: true,
      enum: [0, 1],
      default: 1
    }
  },
  { strict: false, versionKey: false, timestamps: true }
)

export const Customer = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema, 'customers')

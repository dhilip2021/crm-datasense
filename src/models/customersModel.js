import mongoose from 'mongoose'

const CustomersSchema = new mongoose.Schema(
  {
    organization_id: {
      type: String,
      required: true
    },
    customer_id: {
      type: String,
      required: true,
      unique: true
    },
    first_name: { type: String, required: true },
    last_name: {
      type: String
    },
    company_name: {
      type: String
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    industry: { type: String },
    annual_revenue: { type: Number },
    customer_status: {
      type: String,
      enum: ['Prospect', 'Active', 'Inactive']
    },
    lead_source: { type: String },
    preferred_contact_method: { type: String },
    campaign_type_id: { type: Number },
    campaign_name: { type: String },
    campaign_start_date: { type: Date },
    campaign_end_date: { type: Date }
  },
  { timestamps: true }
)

export default mongoose.models.Customers || mongoose.model('Customers', CustomersSchema)

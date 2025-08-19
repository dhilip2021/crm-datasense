import mongoose from 'mongoose'

const CustomerFormSchema = new mongoose.Schema(
  {
    organization_id: {
      type: String,
      required: true
    },
    auto_inc_id: {
      type: String,
      required: [true, 'auto inc id is required'],
      trim: true
    },
    customer_name: {
      type: String,
      required: [true, 'customer name is required'],
      trim: true
    },
    customer_id: {
      type: String,
      required: [true, 'Customer id is required'],
      trim: true
    },
    customer_slug_name: {
      type: String,
      trim: true
    },
    form_name: {
      type: String,
      required: true
    },
    values: {
      type: Object,
      required: true
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { strict: false, versionKey: false, timestamps: true }
)

export default mongoose.models.Customerform || mongoose.model('Customerform', CustomerFormSchema)

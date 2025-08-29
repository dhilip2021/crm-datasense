import mongoose from 'mongoose'

const LeadFormSchema = new mongoose.Schema(
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
    lead_name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true
    },
    lead_id: {
      type: String,
      required: [true, 'Lead id is required'],
      trim: true
    },
    lead_slug_name: {
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
    },
    c_role_id: {
      type: String
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
  { strict: false, versionKey: false, timestamps: true }
)

export default mongoose.models.Leadform || mongoose.model('Leadform', LeadFormSchema)

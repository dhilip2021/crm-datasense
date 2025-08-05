import mongoose from 'mongoose'

const LeadFormSchema = new mongoose.Schema(
  {
    organization_id: {
      type: String,
      required: true
    },
    auto_inc_id  :{
      type: String,
      required: [true, "auto inc id is required"],
      trim: true,
    },
    lead_name: {
      type: String,
      required: [true, "Lead name is required"],
      trim: true,
    },
    lead_id: {
      type: String,
      required: [true, "Lead id is required"],
      trim: true,
    },
    lead_slug_name: {
      type: String,
      trim: true,
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
    }
  },
  {
    timestamps: true // adds createdAt & updatedAt
  }
)

export default mongoose.models.Leadform || mongoose.model('Leadform', LeadFormSchema)

import mongoose from 'mongoose'

const OpportunityReasonSchema = new mongoose.Schema(
  {
    organization_id: {
      type: String,
      required: [true, 'Organization Id is required!'],
      trim: true
    },
    winReasons: {
      type: [String],
      default: []
    },
    lossReasons: {
      type: [String],
      default: []
    },
     c_createdBy: {
      type: String,
    },
    c_updatedBy: {
      type: String,
    },
    c_deletedBy: {
      type: String,
    }
  },
  {
    timestamps: true
  }
)

export const OpportunityReason =
  mongoose.models.OpportunityReason || mongoose.model('OpportunityReason', OpportunityReasonSchema, 'OpportunityReason')

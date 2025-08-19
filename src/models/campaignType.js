import mongoose from "mongoose";

const CampaignTypeSchema = new mongoose.Schema(
  {
    organization_id: {
      type: String,
      required: true
    },
    campaign_type_id: {
      type: Number,
      required: true,
      unique: true,
    },
    campaign_name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.CampaignType || mongoose.model("CampaignType", CampaignTypeSchema);



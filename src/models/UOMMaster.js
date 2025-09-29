import mongoose from "mongoose";

const UOMMasterSchema = new mongoose.Schema(
  {
     organization_id: {
      type: String,
      required: [true, "Organization Id is required!"],
      trim: true,
    },
    uom_id: {
      type: String,
       unique: true,
      required: [true, "UOM Id is required"],
      trim: true,
    },
    uom_code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    uom_label: {
      type: String,
      required: true,
      trim: true
    },
    n_status: {
      type: Number,
      required: true,
      enum: [0, 1],
      default: 1,
    },
    n_published: {
      type: Number,
      required: true,
      enum: [0, 1],
      default: 1,
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
  { timestamps: true }
);

export const UOMMaster = mongoose.models.UOMMaster || mongoose.model("UOMMaster", UOMMasterSchema,"UOMMasters");


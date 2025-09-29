const mongoose = require("mongoose");

var Schema = mongoose.Schema;

const TaxMasterSchema = new Schema(
  {
    organization_id: {
      type: String,
      required: [true, "Organization Id is required!"],
      trim: true,
    },
    tax_id: {
      type: String,
      required: [true, "Tax Id is required"],
      trim: true,
    },
    tax_value: {
      type: Number,
      required: [true, "Tax Value is required"],
      trim: true,
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
  { strict: false, versionKey: false, timestamps: true }
);


export const TaxMaster = mongoose.models.TaxMaster || mongoose.model("TaxMaster", TaxMasterSchema,"TaxMasters");


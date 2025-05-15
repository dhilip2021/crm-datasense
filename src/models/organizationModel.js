const mongoose = require("mongoose");

var Schema = mongoose.Schema;
var validator = require("validator");

const OrganizationSchema = new Schema(
  {
    organization_name: {
      type: String,
      required: [true, "Organization Name is required"],
      trim: true,
    },
    organization_id: {
      type: String,
      required: [true, "Organization Id is required"],
      trim: true,
      unique: true
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
    c_version: {
      type: String,
    },
    c_createdBy: {
      type: String,
    },
    c_updatedBy: {
      type: String,
    },
    c_deletedBy: {
      type: String,
    },
    token: {
      type: String,
    },
    key: {
      type: String,
    },
    endedAt: {
      type: Date,
      default: null,
    },
  },
  { strict: false, versionKey: false, timestamps: true }
);

const Organization = mongoose.models.Organization || mongoose.model("Organization", OrganizationSchema);

module.exports = { Organization };

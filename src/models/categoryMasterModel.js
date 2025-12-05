const mongoose = require("mongoose");

var Schema = mongoose.Schema;

const CategoryMasterSchema = new Schema(
  {
    organization_id: {
      type: String,
      required: [true, "Organization Id is required!"],
      trim: true,
    },
    category_type: {
      type: String,
      required: [true, "Category Type is required"],
      trim: true,
    },
    prod_id: {
      type: String,
      required: [true, "Category Id is required"],
      trim: true,
    },
    prod_name: {
      type: String,
      required: [true, "Category Name is required"],
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


export const CategoryMaster = mongoose.models.CategoryMaster || mongoose.model("CategoryMaster", CategoryMasterSchema,"CategoryMasters");


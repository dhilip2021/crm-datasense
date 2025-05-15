const mongoose = require("mongoose");

const { Schema } = mongoose;


const FieldMenuSchema = new Schema(
  {
      menu_value : {
        type: String,
        trim: true,
    }
  })

  

const FieldItemSchema = new Schema(
  {
    item_id: {
        type: Number,
        trim: true,
      },
    label: {
      type: String,
      trim: true,
    },
    slug_label: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      trim: true,
    },
    mandatory: {
      type: String,
      trim: true,
    },
    items: [FieldMenuSchema],
  },
  { _id: false }
);

const FieldSchema = new Schema(
  {
    organization_id: {
      type: String,
      required: [true, "Organization Id is required!"],
      trim: true,
    },
    field_id: {
      type: String,
    },
    fields: [FieldItemSchema],
    c_createdBy: {
      type: String,
      trim: true,
    },
    c_updatedBy: {
      type: String,
      trim: true,
    },
    c_deletedBy: {
      type: String,
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
  },
  {
    strict: false,
    versionKey: false,
    timestamps: true,
  }
);

// Export the model
export const Field = mongoose.models.Field || mongoose.model("Field", FieldSchema,"field");
const mongoose = require("mongoose");

var Schema = mongoose.Schema;

const ControlSchema = new Schema(
  {
   
    c_control_id: {
      type: String,
      required: [true, "Control Id required"],
      unique: true,
      trim: true,
    },
    c_control_name: {
      type: String,
      unique: true,
      trim: true,
    },
    c_control_type: {
      type: String,
      trim: true,
      required: [true, "Control Type is required"],
    },
    c_control_type: {
      type: String,
      trim: true,
      required: [true, "Control Type is required"],
    },
    c_control: [
      {
        c_name: {
          type: String,
          trim: true,
        },
        c_value: {
          type: String,
          trim: true,
        },
      },
    ],
    c_createdBy: {
      type: String,
      ref: "User",
    },
    c_updatedBy: {
      type: String,
      ref: "User",
    },
    c_deletedBy: {
      type: String,
      ref: "User",
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
  { strict: false, versionKey: false, timestamps: true }
);

const Control =
  mongoose.models.Control ||
  mongoose.model("Control", ControlSchema);

module.exports = { Control };

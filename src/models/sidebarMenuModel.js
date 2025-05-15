const mongoose = require("mongoose");

var Schema = mongoose.Schema;

const SideBarMenuSchema = new Schema(
  {
    c_menu_id: {
      type: String,
      required: [true, "Menu Id is required"],
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    id: {
      type: Number,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["sub", "link", "other"],
      default: "other",
    },
    active: {
      type: Boolean,
      required: true,
      enum: [true, false],
      default: true,
    },
    path: {
      type: String,
      trim: true,
    },
    menucontent: {
      type: String,
      trim: true,
    },
    lanClass: {
      type: String,
      trim: true,
    },
    c_parentId: {
      type: String,
      trim: true,
    },
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

const SideBarMenu =
  mongoose.models.SideBarMenu ||
  mongoose.model("SideBarMenu", SideBarMenuSchema);

module.exports = { SideBarMenu };

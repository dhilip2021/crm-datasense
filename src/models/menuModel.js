const mongoose = require("mongoose");

var Schema = mongoose.Schema;

const MenusSchema = new Schema(
  {
    c_menu_name: {
      type: String,
      required: [true, "Menus Title is required"],
      trim: true,
      unique: true,
    },
    c_menu_id: {
      type: String,
      required: [true, "Menus id is required"],
      trim: true,
      unique: true,
    },
    c_menu_url_link: {
      type: String,
      trim: true,
    },
    c_parentId: {
        type: String,
        trim: true,
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

const Menus =
  mongoose.models.Menus || mongoose.model("Menus", MenusSchema);

module.exports = { Menus };

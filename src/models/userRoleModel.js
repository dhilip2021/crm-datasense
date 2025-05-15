const mongoose = require("mongoose");

var Schema = mongoose.Schema;
var validator = require("validator");

const UserRoleSchema = new Schema(
  {

    c_role_name: {
      type: String,
      required: [true, "Role name is required"],
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isLength(value, { min: 3, max: 125 })) {
          throw Error("Length of the role name should be between 3-125");
        }
      },
    },
    c_role_id:{
      type: String,
      required: [true, "Role id is required"],
      trim: true,
      unique: true
    },
    c_role_priority:{
      type: Number,
      unique: true
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
      enum: [0, 1],
      default: 1,
    },
    n_published: {
      type: Number,
      required: true,
      enum: [0, 1],
      default: 1
    }
  },
  { strict: false, versionKey: false, timestamps: true }
);

const UserRole = mongoose.models.UserRole || mongoose.model("UserRole", UserRoleSchema, "userrole");

module.exports = { UserRole };

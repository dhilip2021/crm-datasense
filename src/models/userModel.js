const mongoose = require("mongoose");

var Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    organization_id: {
      type: String,
      required: [true, "Organization Id is required!"],
      trim: true,
    },
    first_name: {
      type: String,
      required: [true, "Firstname is required"],
      trim: true,
    },
    last_name: {
      type: String,
      required: [true, "Lastname is required"],
      trim: true,
    },
    user_name: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
    },
    user_id: {
      type: String,
      required: [true, "User Id is required"],
      trim: true,
      unique: true
    },
    email: {
      type: String,
      required: [true, "Email number is is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true,
      timestamp: true,
    },
    slug_name: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
    },
    c_user_img_url: {
      type: String,
      trim: true,
    },
    c_role_id: {
      type: String,
      trim: true,
    },
    c_about_user: {
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
  },
  { strict: false, versionKey: false, timestamps: true }
);


export const User = mongoose.models.User || mongoose.model("User", UserSchema,"user");


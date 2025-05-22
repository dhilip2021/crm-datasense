const mongoose = require("mongoose");

var Schema = mongoose.Schema;

const OtpSchema = new Schema(
  {
    otp: {
      type: String,
      required: [true, "OTP is required"],
      trim: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
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
  { strict: false, versionKey: false, timestamps: true }
);


export const OTP = mongoose.models.OTP || mongoose.model("OTP", OtpSchema,"otps");
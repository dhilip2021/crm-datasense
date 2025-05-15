const mongoose = require("mongoose");

var Schema = mongoose.Schema;

const FcmDeviceTokenSchema = new Schema(
  {
    c_fcm_id: {
      type: String,
      required: [true, "FCM Id is required"],
      trim: true,
    },
    c_fcm_device_id: {
      type: String,
      required: [true, "FCM id is required"],
      trim: true,
    },
    c_fcm_device_type: {
      type: String,
      required: [true, "FCM type is required"],
      trim: true,
    },
    c_fcm_device_token: {
      type: String,
      required: [true, "FCM Device Token is required"],
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


export const FcmDeviceToken = mongoose.models.FcmDeviceToken || mongoose.model("FcmDeviceToken", FcmDeviceTokenSchema,"fcmdevicetokens");
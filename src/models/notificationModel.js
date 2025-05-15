const mongoose = require("mongoose");

var Schema = mongoose.Schema;

const NotificationSchema = new Schema(
  {

    c_notification_id: {
      type: String,
      required: [true, "Notification Id is required"],
      trim: true,
      unique: true,
    },
    c_notification_title: {
      type: String,
      required: [true, "Notification Title is required"],
      trim: true,
    },
    c_notification_content: {
      type: String,
      required: [true, "Notification content is required"],
      trim: true,
    },
    c_notification_redirect_url: {
      type: String,
      trim: true,
    },
    c_notification_icon: {
      type: String,
      trim: true,
    },
    c_notification_list: [
      {
        c_device_id: {
          type: String,
          trim: true,
        },
        c_read_status: {
            type: Number,
            trim: true,
          },
      },
    ],
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

export const Notification = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema,"notifications");
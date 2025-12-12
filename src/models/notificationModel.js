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
    c_title: {
      type: String,
      required: [true, "Notification Title is required"],
      trim: true,
    },
    c_message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
    },
    c_icon: {
      type: String,
      trim: true,
    },
    c_link: {
      type: String,
      trim: true,
    },
    c_type: {
      type: String,
      trim: true,
    },

    // Correct structure for send_to array
    c_send_to: [
      {
        c_user_id: {
          type: String,
          trim: true,
        },
        c_read_status: {
          type: Number,
          default: 0,
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

// ---------------------------------------------
// 🔥 DUPLICATE PREVENTION INDEX
// ---------------------------------------------
NotificationSchema.index(
  {
    c_title: 1,
    c_message: 1,
    c_type: 1,
    c_link: 1,
    "c_send_to.c_user_id": 1
  },
  { unique: true, sparse: true }
);

export const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema, "notifications");

const mongoose = require("mongoose");

var Schema = mongoose.Schema;

const ConsolelogSchema = new Schema(
  {
    user_id: {
      type: String,
      required: [true, "User Id is required"],
    },
    user_name: {
      type: String,
      required: [true, "User Name is required"]
    },
    email: {
        type: String,
        required: [true, "Email is required"]
      },
    sign_in_time: {
        type: String,
        required: [true, "sign in is required"]
    },
    sign_out_time: {
        type: String,
    },
    n_status: {
      type: Number,
      required: true,
      enum: [0, 1],
      default: 0
    }
  },
  { strict: false, versionKey: false, timestamps: true }
);


export const Consolelog = mongoose.models.Consolelog || mongoose.model("Consolelog", ConsolelogSchema);

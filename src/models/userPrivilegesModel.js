const mongoose = require("mongoose");

var Schema = mongoose.Schema;

const UserPrivilegesSchema = new Schema(
  {
    c_privilege_name: {
      type: String,
      trim: true,
      lowercase: true,
    },
    c_privilege_id: {
      type: String,
      required: [true, "Privilege id is required"],
      trim: true,
      lowercase: true,
    },
    c_role_id: {
      type: String,
      required: [true, "Role id is required"],
      trim: true,
      lowercase: true,
    },
    c_role_privileges: [
      {
        role_privileage: {
          type: String,

          //   enum: ["add", "edit", "delete", "view"],
          //   default: "add",
        },
      },
    ],
    c_menu_list: [
      {
        menu_list_id: {
          type: String,
        },
        menu_list_name: {
          type: String,
        },
      },
    ],
    c_menu_privileges: [
      {
        menu_privileage_id: {
          type: String,
        },
        menu_privileage_name: {
          type: String,
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


export const UserPrivileges = mongoose.models.UserPrivileges || mongoose.model("UserPrivileges", UserPrivilegesSchema,"userprivileges");
const mongoose = require('mongoose')

var Schema = mongoose.Schema

const RolesAndPermissionSchema = new Schema(
  {
    c_roles_permission_id: {
      type: String,
      required: [true, 'Roles and Permission  id is required'],
      trim: true,
      lowercase: true,
      unique: true
    },
    organization_id: {
      type: String,
      required: [true, 'Organization Id is required'],
      trim: true
    },
    c_user_id: {
      type: String,
      required: [true, 'User id is required'],
      trim: true,
      lowercase: true
    },

    menu_privileges_status: [
      {
        menu_privileage_name: {
          type: String
        },
        sub_menu_privileage_name: {
          type: String
        },
        add_status: {
          type: Boolean
        },
        edit_status: {
          type: Boolean
        },
        view_status: {
          type: Boolean
        },
        delete_status: {
          type: Boolean
        }
      }
    ],
    c_createdBy: {
      type: String
    },
    c_updatedBy: {
      type: String
    },
    c_deletedBy: {
      type: String
    },
    n_status: {
      type: Number,
      enum: [0, 1],
      default: 1
    },
    n_published: {
      type: Number,
      required: true,
      enum: [0, 1],
      default: 1
    }
  },
  { strict: false, versionKey: false, timestamps: true }
)

export const RolesandPermission =
  mongoose.models.RolesandPermission ||
  mongoose.model('RolesandPermission', RolesAndPermissionSchema, 'rolesandPermission')

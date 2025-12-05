const mongoose = require('mongoose')

var Schema = mongoose.Schema
var validator = require('validator')

const OrganizationSchema = new Schema(
  {
    organization_name: {
      type: String,
      required: [true, 'Organization Name is required'],
      trim: true,
      unique: true
    },
    organization_id: {
      type: String,
      required: [true, 'Organization Id is required'],
      trim: true,
      unique: true
    },
    organization_logo: {
      type: String,
      trim: true
    },
    organization_address: {
      type: String,
      trim: true
    },
    organization_emp_count: {
      type: String,
      trim: true
    },
    organization_currency: {
      type: String,
      trim: true
    },
    companyType: {
      type: [String],
      trim: true,
      set: values => values.map(v => v.charAt(0).toUpperCase() + v.slice(1).toLowerCase()),
      validate: {
        validator: function (values) {
          const allowed = ['product', 'service', 'license', 'warranty', 'subscription']
          return values.every(v => allowed.includes(v.toLowerCase()))
        },
        message: props => `${props.value} is not a valid company type`
      }
    },
    n_status: {
      type: Number,
      required: true,
      enum: [0, 1],
      default: 1
    },
    n_published: {
      type: Number,
      required: true,
      enum: [0, 1],
      default: 1
    },
    c_version: {
      type: String
    },
    c_createdBy: {
      type: String
    },
    c_updatedBy: {
      type: String
    },
    c_deletedBy: {
      type: String
    },
    token: {
      type: String
    },
    key: {
      type: String
    },
    endedAt: {
      type: Date,
      default: null
    }
  },
  { strict: false, versionKey: false, timestamps: true }
)

export const Organization =
  mongoose.models.Organization || mongoose.model('Organization', OrganizationSchema, 'organizations')

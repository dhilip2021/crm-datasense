const mongoose = require('mongoose')

var Schema = mongoose.Schema

const SalutationSchema = new Schema(
  {
    salutation_id: {
      type: String,
      required: [true, 'Salutation Id is required!'],
      trim: true
    },
    salutation_name: {
      type: String,
      required: [true, 'Salutation Name is required!'],
      trim: true
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
    }
  },
  { strict: false, versionKey: false, timestamps: true }
)

export const Salutation = mongoose.models.Salutation || mongoose.model('Salutation', SalutationSchema, 'salutations')

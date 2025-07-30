const mongoose = require('mongoose')

var Schema = mongoose.Schema

const GenderSchema = new Schema(
  {
    gender_id: {
      type: String,
      required: [true, 'gender Id is required!'],
      trim: true
    },
    gender_name: {
      type: String,
      required: [true, 'gender Name is required!'],
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

export const Gender = mongoose.models.Gender || mongoose.model('Gender', GenderSchema, 'genders')

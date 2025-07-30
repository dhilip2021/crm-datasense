const mongoose = require('mongoose');

const TerritorySchema = new mongoose.Schema(
  {
    territory_id: {
      type: String,
      required: [true, 'Territory ID is required'],
      trim: true,
    },
    territory_name: {
      type: String,
      required: [true, 'Territory Name is required'],
      trim: true,
    },
    is_group: {
      type: Boolean,
      default: false,
    },
    parent_territory: {
      type: String, // reference to parent territory_id
      default: null,
    },
    group_by: {
      type: String,
      default: 'All Territories',
    },
    c_createdBy: String,
    c_updatedBy: String,
    c_deletedBy: String,
    n_status: {
      type: Number,
      enum: [0, 1],
      default: 1,
    },
    n_published: {
      type: Number,
      enum: [0, 1],
      default: 1,
    }
  },
  { timestamps: true, versionKey: false }
);

export const Territory = mongoose.models.Territory || mongoose.model('Territory', TerritorySchema, 'territories');

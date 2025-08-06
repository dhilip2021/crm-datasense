import mongoose from 'mongoose'

const FieldSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    label: { type: String },
    subType: { type: String },
    placeholder: { type: String },
    required: { type: Boolean, default: false },
    minChars: { type: Number },
    maxChars: { type: Number },
    rowSize: { type: Number },
    maxLength: { type: Number },
    allowDuplicate: { type: Boolean },
    allowPastDate: { type: Boolean },    
    allowSplCharacter: { type: Boolean },
    autoComplte: { type: Boolean },
    noDuplicates: { type: Boolean },
    isPublic: { type: Boolean },
    isEncrypted: { type: Boolean },
    isExternal: { type: Boolean },
    showTooltip: { type: Boolean },
    tooltipMessage: { type: String },
    tooltipType: { type: String },
    options: [String], // For Pick List
    defaultValue: { type: String },
    sortOrder: { type: String },
    minDigits: { type: String },
    maxDigits: { type: String },
    decimalPlaces: { type: String },
    rounding: { type: String },
    trackHistory: { type: Boolean },
    useSeparator: { type: Boolean },
    enableColor: { type: Boolean },
    defaultChecked: { type: Boolean },
    createFor: [String]
  },
  { _id: false }
)

const SectionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String },
    layout: { type: String, enum: ['single', 'double'], default: 'double' },
    fields: {
      left: [FieldSchema],
      right: [FieldSchema]
    }
  },
  { _id: false }
)

const LeadTemplateSchema = new mongoose.Schema(
  {
    organization_id: { type: String, required: true },
    form_name: { type: String, required: true },
    version: { type: Number, default: 1 },
    sections: [SectionSchema]
  },
  { strict: false, versionKey: false, timestamps: true }
)

export default mongoose.models.LeadTemplate || mongoose.model('LeadTemplate', LeadTemplateSchema)

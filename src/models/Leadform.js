import mongoose from 'mongoose'




const ItemRefSchema = new mongoose.Schema(
  {
    itemMasterRef: { type: mongoose.Schema.Types.ObjectId, ref: 'ItemMaster' },
    item_id: { type: String },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number },
    discount: { type: Number, default: 0 },
    finalPrice: { type: Number },
    discountType: { type: String }
  },
  { _id: true } // keep _id for each item
)

const OrderSchema = new mongoose.Schema(
  {
    order_id: { type: String, required: true },
    item_ref: [ItemRefSchema] // nested item list
  },
  { _id: false }
)

// ------------------ Sub Schemas ------------------ //
const NoteSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    title: { type: String, default: null },
    note: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: String, default: null }
  },
  { _id: false }
)

const TaskSchema = new mongoose.Schema(
  {
    subject: { type: String, default: null },
    dueDate: { type: Date, default: null },
    priority: { type: String, default: null },
    status: { type: String, default: null },
    owner: { type: String, default: null },
    reminderEnabled: { type: Boolean, default: false },
    reminderDate: { type: Date, default: null },
    reminderTime: { type: String, default: null },
    alertType: { type: String, default: 'Email' },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: String, default: null }
  },
  { _id: false }
)

const ActivitySchema = new mongoose.Schema(
  {
    task: [TaskSchema]
  },
  { _id: false }
)

// ------------------ Main Schema ------------------ //
const LeadFormSchema = new mongoose.Schema(
  {
    organization_id: {
      type: String,
      required: true
    },
    auto_inc_id: {
      type: String,
      required: [true, 'auto inc id is required'],
      trim: true
    },
    lead_name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true
    },
    lead_id: {
      type: String,
      required: [true, 'Lead id is required'],
      trim: true
    },
    lead_slug_name: {
      type: String,
      trim: true
    },
    form_name: {
      type: String,
      required: true
    },
    lead_touch: {
      type: String,
      enum: ['touch', 'untouch'],
      default: 'untouch'
    },
    lead_flag: {
      type: Number,
      default: 0
    },
    // 👇 Structure for Notes + Activity inside values
    values: {
      type: Object,
      required: true
    },
    // products: [
    //   {
    //     productRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    //     product_id: { type: String },
    //     quantity: { type: Number, default: 1 },
    //     unitPrice: { type: Number },
    //     discount: { type: Number, default: 0 },
    //     finalPrice: { type: Number },
    //     discountType: { type: String }
    //   }
    // ],

    // 🔥 new structure
    items: [OrderSchema],

    // items: [
    //   {
    //     itemMasterRef: { type: mongoose.Schema.Types.ObjectId, ref: 'ItemMaster' }, // ✅ required for populate
    //     item_id: { type: String },
    //     quantity: { type: Number, default: 1 },
    //     unitPrice: { type: Number },
    //     discount: { type: Number, default: 0 },
    //     finalPrice: { type: Number },
    //     discountType: { type: String }
    //   }
    // ],

    'values.Notes': [NoteSchema],
    'values.Activity': [ActivitySchema],

    submittedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },

    c_role_id: { type: String },
    c_createdBy: { type: String },
    c_updatedBy: { type: String },
    c_deletedBy: { type: String }
  },
  { strict: false, versionKey: false, timestamps: true }
)

export default mongoose.models.Leadform || mongoose.model('Leadform', LeadFormSchema)

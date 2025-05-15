const mongoose = require("mongoose");

var Schema = mongoose.Schema;
var validator = require("validator");

const LeadSchema = new Schema(
  {
    organization_id: {
      type: String,
      required: [true, "Organization Id is required!"],
      trim: true,
    },
    salutation: {
      type: String,
    },
    auto_inc_id  :{
      type: String,
      required: [true, "auto inc id is required"],
      trim: true,
    },
    lead_name: {
      type: String,
      required: [true, "Lead name is required"],
      trim: true,
    },
    lead_id: {
      type: String,
      required: [true, "Lead id is required"],
      trim: true,
    },
    lead_slug_name: {
      type: String,
      trim: true,
    },
    first_name: {
      type: String,
      required: [true, "Lead name is required"],
      trim: true,
    },
    last_name: {
      type: String,
    },
    email: {
      type: String,
      trim: true,
    },
    mobile: {
      type: String,
    },
    phone: {
      type: String,
    },
    gender: {
      type: String,
    },
    organization: {
      type: String,
    },
    website: {
      type: String,
    },
    no_of_employees: {
      type: String,
    },
    annual_revenue: {
      type: String,
    },
    industry: {
      type: String,
    },
    job_title: {
      type: String,
    },
    lead_source: {
      type: String,
    },
    status: {
      type: String,
    },
    live_status: {
      type: String,
    },
    c_activities: [
      {
        c_activity: {
          type: String,
        },
        createdAt:   { 
          type: Date,   
          default: Date.now 
        },
        status: {
          type: Number,
          enum: [0, 1],
          default: 1,
        }
      },
    ],
    c_emails: [
      {
        c_email: {
          type: String,
        },
      },
    ],
    c_comments: [
      {
        c_comment: {
          type: String,
        },
      },
    ],
    c_calls: [
      {
        c_call: {
          type: String,
        },
      },
    ],
    c_tasks: [
      {
        title: {
          type: String,
        },
        comment: {
          type: String,
        },
        log: {
          type: String,
        },
        priority: {
          type: String,
        },
        date_time: {
          type: String,
        },
        createdAt:   { 
          type: Date,   
          default: Date.now 
        },
        status: {
          type: Number,
          enum: [0, 1],
          default: 1,
        }
      },
    ],
    c_notes: [
      {
        title: {
          type: String,
        },
        comment: {
          type: String,
        },
        createdAt:   { 
          type: Date,   
          default: Date.now 
        },
        status: {
          type: Number,
          enum: [0, 1],
          default: 1,
        }
      },
    ],
    c_attachments: [
      {
        c_attachment: {
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

export const Lead = mongoose.models.Lead || mongoose.model("Lead", LeadSchema,"leads");

// File: app/api/v1/admin/lead-form/[lead_id]/route.js
// company name showing

import { verifyAccessToken } from '@/helper/clientHelper'
import connectMongoDB from '@/libs/mongodb'
import { ItemMaster } from '@/models/ItemMasterModel'
import Leadform from '@/models/Leadform'
import { Organization } from '@/models/organizationModel' // 👈 Add this model import
import mongoose from 'mongoose'
import { NextResponse } from 'next/server'

// 🔥 Lead Scoring Logic (same as before)
const calculateLeadScore = values => {
  let score = 0
  const designation = values['Job Tilte']
  const companySize = values['Company Size']
  const industry = values['Industry']
  const location = values['City']

  if (
    designation &&
    [
      'Chief Financial Officer',
      'Architect',
      'Building services engineer',
      'Licensed conveyancer',
      'Sports development officer',
      'CEO',
      'Manager',
      'Founder'
    ].includes(designation)
  )
    score += 25
  if (companySize && parseInt(companySize) > 50) score += 15
  if (
    industry &&
    ['Logistics', 'Manufacturing', 'Logistics', 'FMCG', 'Education', 'Pharma', 'Retail'].includes(industry)
  )
    score += 20
  if (
    location &&
    [
      'Kennethchester',
      'North Austinville',
      'Port Heathertown',
      'South Samanthamouth',
      'Chennai',
      'Coimabtore',
      'Bangalore',
      'Delhi'
    ].includes(location)
  )
    score += 10

  if (Object.values(values).length >= 8) score += 15
  if (values['Clicked Email'] || values['Opened WhatsApp']) score += 10
  if (values['Requested Demo'] || values['Asked for Quote']) score += 20
  if (values['Last Contact Date'] && new Date(values['Last Contact Date']) < Date.now() - 7 * 24 * 60 * 60 * 1000)
    score -= 10

  let label = 'Cold Lead'
  if (score >= 75) label = 'Hot Lead'
  else if (score >= 50) label = 'Warm Lead'

  return { lead_score: score, lead_label: label }
}

export async function GET(req, { params }) {
  const verified = verifyAccessToken()
  await connectMongoDB()

  if (!verified.success) {
    return NextResponse.json(
      { success: false, message: '', error: 'token expired!' },
      { status: 400 }
    )
  }

  try {
    const { lead_id } = params
    if (!lead_id) {
      return NextResponse.json({ success: false, message: 'Missing lead_id' }, { status: 400 })
    }

    // 🧩 1. Fetch lead
    const lead = await Leadform.findOne({ lead_id }).lean()
    if (!lead) {
      return NextResponse.json({ success: false, message: 'Lead not found' }, { status: 404 })
    }

    // 🧩 2. Fetch related organization
    const organization = await Organization.findOne({
      organization_id: lead.organization_id
    }).lean()

    // 🧩 3. Populate item details if available
    if (lead?.items?.length) {
      await ItemMaster.populate(
        lead.items.flatMap(i => i.item_ref),
        { path: 'itemMasterRef', select: 'item_code item_name item_type uom gst description mrp' }
      )
    }

    // ✅ 4. Attach organization_name to response
    const response = {
      ...lead,
      organization_name: organization?.organization_name || null
    }

    return NextResponse.json({ success: true, data: response })
  } catch (error) {
    console.error('⨯ Lead fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal Server Error', error: error.message },
      { status: 500 }
    )
  }
}


// 🔁 PUT – Update lead by lead_id
// export async function PUT(req, { params }) {
//   const verified = verifyAccessToken()

//   await connectMongoDB()
//   const { lead_id } = params
//   const body = await req.json()

//   if (verified.success) {
//     try {
//       const lead = await Leadform.findOne({ lead_id })

//       if (!lead) {
//         return NextResponse.json({ success: false, message: 'Lead not found' }, { status: 404 })
//       }

//       // 🔁 Recalculate lead score before update
//       const { lead_score, lead_label } = calculateLeadScore(body.values || {})

//       const updatedValues = {
//         ...body.values,
//         Score: lead_score,
//         Label: lead_label
//       }

//       // 📝 Fields to update
//       const updateFields = {
//         values: updatedValues,
//         updatedAt: new Date()
//       }

//       // 🚀 Include lead_name if provided
//       if (body.lead_name) {
//         updateFields.lead_name = body.lead_name
//       }

//       if (body.lead_slug_name) {
//         updateFields.lead_slug_name = body.lead_slug_name
//       }

//       // 🚀 Include form_name if provided
//       if (body.form_name) {
//         updateFields.form_name = body.form_name
//       }

//       const updated = await Leadform.findOneAndUpdate({ lead_id }, { $set: updateFields }, { new: true })

//       return NextResponse.json({
//         success: true,
//         message: 'Lead updated successfully !!!',
//         data: updated
//       })
//     } catch (error) {
//       console.error('⨯ Lead update error:', error)
//       return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
//     }
//   } else {
//     return NextResponse.json(
//       {
//         success: false,
//         message: '',
//         error: 'token expired!'
//       },
//       { status: 400 }
//     )
//   }
// }

// function normalizeIds(values) {
//   const normalized = { ...values }

//   // 🔁 Notes
//   if (Array.isArray(normalized.Notes)) {
//     normalized.Notes = normalized.Notes.map(note => ({
//       ...note,
//       _id: note._id ? new mongoose.Types.ObjectId(note._id) : new mongoose.Types.ObjectId()
//     }))
//   }

//   // 🔁 Activity + Tasks
//   if (Array.isArray(normalized.Activity)) {
//     normalized.Activity = normalized.Activity.map(act => ({
//       ...act,
//       task: Array.isArray(act.task)
//         ? act.task.map(t => ({
//             ...t,
//             _id: t._id ? new mongoose.Types.ObjectId(t._id) : new mongoose.Types.ObjectId()
//           }))
//         : []
//     }))
//   }

//   return normalized
// }

// export async function PUT(req, { params }) {
//   const verified = verifyAccessToken()
//   await connectMongoDB()
//   const { lead_id } = params
//   const body = await req.json()

//   if (!verified.success) {
//     return NextResponse.json({ success: false, error: 'token expired!' }, { status: 400 })
//   }

//   try {
//     const lead = await Leadform.findOne({ lead_id })
//     if (!lead) {
//       return NextResponse.json({ success: false, message: 'Lead not found' }, { status: 404 })
//     }

//     // 🔁 Normalize ObjectIds
//     const normalizedValues = normalizeIds(body.values || {})

//     // 🔁 Recalculate score
//     const { lead_score, lead_label } = calculateLeadScore(normalizedValues)

//     const updateFields = {
//       values: { ...normalizedValues, Score: lead_score, Label: lead_label },
//       updatedAt: new Date()
//     }

//     if (body.lead_name) updateFields.lead_name = body.lead_name
//     if (body.lead_slug_name) updateFields.lead_slug_name = body.lead_slug_name
//     if (body.form_name) updateFields.form_name = body.form_name

//     const updated = await Leadform.findOneAndUpdate({ lead_id }, { $set: updateFields }, { new: true })

//     return NextResponse.json({
//       success: true,
//       message: 'Lead updated successfully !!!',
//       data: updated
//     })
//   } catch (error) {
//     console.error('⨯ Lead update error:', error)
//     return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
//   }
// }

function normalizeIds(values) {
  const normalized = { ...values }

  // 🔁 Notes
  if (values.Notes && Array.isArray(values.Notes)) {
    normalized.Notes = values.Notes.map(note => ({
      ...note,
      _id: note._id ? new mongoose.Types.ObjectId(note._id) : new mongoose.Types.ObjectId()
    }))
  }

  // 🔁 Activity + Tasks
  if (values.Activity && Array.isArray(values.Activity)) {
    normalized.Activity = values.Activity.map(act => ({
      ...act,
      task: Array.isArray(act.task)
        ? act.task.map(t => ({
            ...t,
            _id: t._id ? new mongoose.Types.ObjectId(t._id) : new mongoose.Types.ObjectId()
          }))
        : []
    }))
  }

  return normalized
}

export async function PUT(req, { params }) {
  const verified = verifyAccessToken()
  await connectMongoDB()
  const { lead_id } = params
  const body = await req.json()

  if (!verified.success) {
    return NextResponse.json({ success: false, error: 'token expired!' }, { status: 400 })
  }

  try {
    const lead = await Leadform.findOne({ lead_id })
    if (!lead) {
      return NextResponse.json({ success: false, message: 'Lead not found' }, { status: 404 })
    }

    // 🔁 Normalize only provided values
    const normalizedValues = normalizeIds(body.values || {})

    // 🔁 Start with existing values
    const mergedValues = { ...lead.values }

    // Only update keys present in payload
    Object.keys(normalizedValues).forEach(key => {
      mergedValues[key] = normalizedValues[key]
    })

    // 🔁 Recalculate score
    const { lead_score, lead_label } = calculateLeadScore(mergedValues)

    const updateFields = {
      values: { ...mergedValues, Score: lead_score, Label: lead_label },
      updatedAt: new Date()
    }

    if (body.lead_name) updateFields.lead_name = body.lead_name
    if (body.lead_flag !== undefined) updateFields.lead_flag = body.lead_flag
    if (body.lead_touch) updateFields.lead_touch = body.lead_touch
    if (body.lead_slug_name) updateFields.lead_slug_name = body.lead_slug_name
    if (body.form_name) updateFields.form_name = body.form_name

    const updated = await Leadform.findOneAndUpdate({ lead_id }, { $set: updateFields }, { new: true })

    return NextResponse.json({
      success: true,
      message: 'Lead updated successfully !!!',
      data: updated
    })
  } catch (error) {
    console.error('⨯ Lead update error:', error)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}

const toObjectId = id => {
  try {
    return new mongoose.Types.ObjectId(id)
  } catch {
    return new mongoose.Types.ObjectId()
  }
}

export async function PATCH(req, { params }) {
  const verified = verifyAccessToken()
  await connectMongoDB()
  const { lead_id } = params
  const body = await req.json()

  if (verified.success) {
    try {
      const lead = await Leadform.findOne({ lead_id })
      if (!lead) {
        return NextResponse.json({ success: false, message: 'Lead not found' }, { status: 404 })
      }

      // ---------------- NOTES ----------------
      const noteFromBody = body.values?.Notes?.[0] || {}

      let newNote = null
      let updateNote = null
      let newTask = null
      let updateTask = null

      if (noteFromBody && (noteFromBody.title || noteFromBody.note)) {
        if (noteFromBody._id) {
          console.log('coming 1')

          updateNote = {
            title: noteFromBody.title || null,
            note: noteFromBody.note || null,
            createdAt: noteFromBody.createdAt ? new Date(noteFromBody.createdAt) : new Date(),
            createdBy: noteFromBody.createdBy || null
          }
        } else {
          console.log('coming 2')
          newNote = {
            _id: new mongoose.Types.ObjectId(),
            title: noteFromBody.title || null,
            note: noteFromBody.note || null,
            createdAt: noteFromBody.createdAt ? new Date(noteFromBody.createdAt) : new Date(),
            createdBy: noteFromBody.createdBy || null
          }
        }
      }

      // ---------------- TASK ----------------
      const activityFromBody = body.values?.Activity?.[0] || {}
      const taskFromBody = activityFromBody.task?.[0] || {}

      if (taskFromBody && (taskFromBody.subject || taskFromBody.dueDate)) {
        if (taskFromBody._id) {
          updateTask = {
            subject: taskFromBody.subject || null,
            dueDate: taskFromBody.dueDate ? new Date(taskFromBody.dueDate) : null,
            priority: taskFromBody.priority || null,
            status: taskFromBody.status || null,
            owner: taskFromBody.owner || null,
            reminderEnabled: !!taskFromBody.reminderEnabled,
            reminderDate: taskFromBody.reminderDate ? new Date(taskFromBody.reminderDate) : null,
            reminderTime: taskFromBody.reminderTime || null,
            alertType: taskFromBody.alertType || 'Email',
            createdAt: new Date()
          }
        } else {
          newTask = {
            _id: new mongoose.Types.ObjectId(),
            subject: taskFromBody.subject || null,
            dueDate: taskFromBody.dueDate ? new Date(taskFromBody.dueDate) : null,
            priority: taskFromBody.priority || null,
            status: taskFromBody.status || null,
            owner: taskFromBody.owner || null,
            reminderEnabled: !!taskFromBody.reminderEnabled,
            reminderDate: taskFromBody.reminderDate ? new Date(taskFromBody.reminderDate) : null,
            reminderTime: taskFromBody.reminderTime || null,
            alertType: taskFromBody.alertType || 'Email',
            createdAt: new Date()
          }
        }
      }

      // ---------------- UPDATE QUERY ----------------

      const updateFields = { updatedAt: new Date() }

      // lead_touch set panna
      if (body.lead_touch !== undefined) {
        updateFields.lead_touch = body.lead_touch
      }

      const updateQuery = { $set: updateFields }

      // Notes push
      if (newNote) {
        newNote._id = toObjectId(newNote._id)
        updateQuery.$push = { ...(updateQuery.$push || {}), 'values.Notes': newNote }
      }

      // Tasks push
      if (newTask) {
        newTask._id = toObjectId(newTask._id)
        updateQuery.$push = { ...(updateQuery.$push || {}), 'values.Activity.0.task': newTask }
      }

      if (updateNote) {
        const noteId = toObjectId(noteFromBody._id)
        const updated = await Leadform.findOneAndUpdate(
          { lead_id },
          {
            $set: {
              'values.Notes.$[n].title': updateNote.title,
              'values.Notes.$[n].note': updateNote.note,
              'values.Notes.$[n].createdAt': updateNote.createdAt,
              'values.Notes.$[n].createdBy': updateNote.createdBy,
              lead_touch: body.lead_touch, // ✅ also update here
              updatedAt: new Date()
            }
          },
          {
            arrayFilters: [{ 'n._id': noteId }],
            new: true
          }
        )
        return NextResponse.json({ success: true, message: 'Note updated successfully', data: updated })
      }

      if (updateTask) {
        const taskId = toObjectId(taskFromBody._id)
        const updatedTask = await Leadform.findOneAndUpdate(
          { lead_id },
          {
            $set: {
              'values.Activity.0.task.$[t].subject': updateTask.subject,
              'values.Activity.0.task.$[t].dueDate': updateTask.dueDate,
              'values.Activity.0.task.$[t].priority': updateTask.priority,
              'values.Activity.0.task.$[t].status': updateTask.status,
              'values.Activity.0.task.$[t].owner': updateTask.owner,
              'values.Activity.0.task.$[t].reminderEnabled': updateTask.reminderEnabled,
              'values.Activity.0.task.$[t].reminderDate': updateTask.reminderDate,
              'values.Activity.0.task.$[t].reminderTime': updateTask.reminderTime,
              'values.Activity.0.task.$[t].alertType': updateTask.alertType,
              'values.Activity.0.task.$[t].createdAt': updateTask.createdAt,
              lead_touch: body.lead_touch, // ✅ also update here
              updatedAt: new Date()
            }
          },
          {
            arrayFilters: [{ 't._id': taskId }],
            new: true
          }
        )
        return NextResponse.json({ success: true, message: 'Task updated successfully', data: updatedTask })
      }

      const updated = await Leadform.findOneAndUpdate({ lead_id }, updateQuery, { new: true, upsert: true })

      return NextResponse.json({
        success: true,
        message: 'Updated successfully',
        data: updated
      })

      // if (updateNote) {
      //   const noteId = toObjectId(noteFromBody._id)
      //   // const noteId = new mongoose.Types.ObjectId(noteFromBody._id)
      //   const updated = await Leadform.findOneAndUpdate(
      //     { lead_id },
      //     {
      //       $set: {
      //         'values.Notes.$[n].title': updateNote.title,
      //         'values.Notes.$[n].note': updateNote.note,
      //         'values.Notes.$[n].createdAt': updateNote.createdAt,
      //         'values.Notes.$[n].createdBy': updateNote.createdBy,
      //         updatedAt: new Date()
      //       }
      //     },
      //     {
      //       arrayFilters: [{ 'n._id': noteId }],
      //       new: true
      //     }
      //   )

      //   return NextResponse.json({
      //     success: true,
      //     message: 'Note updated successfully',
      //     data: updated
      //   })
      // }

      // if (newTask) {
      //   newTask._id = toObjectId(newTask._id)
      //   updateQuery.$push = { ...(updateQuery.$push || {}), 'values.Activity.0.task': newTask }
      // }

      // if (updateTask) {

      //   const taskId = toObjectId(taskFromBody._id)

      //   const updatedTask = await Leadform.findOneAndUpdate(
      //     { lead_id },
      //     {
      //       $set: {
      //         'values.Activity.0.task.$[t].subject': updateTask.subject,
      //         'values.Activity.0.task.$[t].dueDate': updateTask.dueDate,
      //         'values.Activity.0.task.$[t].priority': updateTask.priority,
      //         'values.Activity.0.task.$[t].status': updateTask.status,
      //         'values.Activity.0.task.$[t].owner': updateTask.owner,
      //         'values.Activity.0.task.$[t].reminderEnabled': updateTask.reminderEnabled,
      //         'values.Activity.0.task.$[t].reminderDate': updateTask.reminderDate,
      //         'values.Activity.0.task.$[t].reminderTime': updateTask.reminderTime,
      //         'values.Activity.0.task.$[t].alertType': updateTask.alertType,
      //         'values.Activity.0.task.$[t].createdAt': updateTask.createdAt,
      //         updatedAt: new Date()
      //       }
      //     },
      //     {
      //       arrayFilters: [{ 't._id': taskId }],
      //       new: true
      //     }
      //   )

      //   console.log(updatedTask, '<<< updatedTask')

      //   return NextResponse.json({
      //     success: true,
      //     message: 'Task updated successfully',
      //     data: updatedTask
      //   })
      // }

      // if (!updateQuery.$push) {
      //   return NextResponse.json({ success: false, message: 'Nothing to update' }, { status: 400 })
      // }

      // const updated = await Leadform.findOneAndUpdate({ lead_id }, updateQuery, { new: true, upsert: true })
    } catch (error) {
      console.error('⨯ Add note+activity error:', error)
      return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
    }
  } else {
    return NextResponse.json(
      {
        success: false,
        message: '',
        error: 'token expired!'
      },
      { status: 400 }
    )
  }
}

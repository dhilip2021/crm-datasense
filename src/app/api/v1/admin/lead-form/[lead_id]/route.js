// File: app/api/v1/admin/lead-form/[lead_id]/route.js

import { verifyAccessToken } from '@/helper/clientHelper'
import connectMongoDB from '@/libs/mongodb'
import Leadform from '@/models/Leadform'
import mongoose from 'mongoose'
import { NextResponse } from 'next/server'

// 🔥 Lead Scoring Logic
const calculateLeadScore = values => {
  let score = 0

  // 🧩 Demographic
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

  // 📈 Behavioral
  if (Object.values(values).length >= 8) score += 15
  if (values['Clicked Email'] || values['Opened WhatsApp']) score += 10
  if (values['Requested Demo'] || values['Asked for Quote']) score += 20
  if (values['Last Contact Date'] && new Date(values['Last Contact Date']) < Date.now() - 7 * 24 * 60 * 60 * 1000)
    score -= 10

  // 🏷️ Lead Label
  let label = 'Cold Lead'
  if (score >= 75) label = 'Hot Lead'
  else if (score >= 50) label = 'Warm Lead'

  return { lead_score: score, lead_label: label }
}

export async function GET(req, { params }) {
  const verified = verifyAccessToken()
  await connectMongoDB()
  if (verified.success) {
    try {
      const { lead_id } = params

      if (!lead_id) {
        return NextResponse.json({ success: false, message: 'Missing lead_id' }, { status: 400 })
      }

      const lead = await Leadform.findOne({ lead_id }).select('-__v').lean()

      if (!lead) {
        return NextResponse.json({ success: false, message: 'Lead not found' }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: lead
      })
    } catch (error) {
      console.error('⨯ Lead fetch error:', error)
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

// 🔁 PUT – Update lead by lead_id
// export async function PUT(req, { params }) {
//   await connectMongoDB()
//   const { lead_id } = params
//   const body = await req.json()

//   try {
//     const lead = await Leadform.findOne({ lead_id })

//     if (!lead) {
//       return NextResponse.json(
//         { success: false, message: 'Lead not found' },
//         { status: 404 }
//       )
//     }

//     // 🔁 Recalculate lead score before update
//     const { lead_score, lead_label } = calculateLeadScore(body.values)

//     const updatedValues = {
//       ...body.values,
//       Score: lead_score,
//       Label: lead_label
//     }

//     const updated = await Leadform.findOneAndUpdate(
//       { lead_id },
//       {
//         $set: {
//           values: updatedValues,
//           updatedAt: new Date()
//         }
//       },
//       { new: true }
//     )

//     return NextResponse.json({
//       success: true,
//       message: 'Lead updated successfully !!!',
//       data: updated
//     })
//   } catch (error) {
//     return NextResponse.json(
//       { success: false, message: 'Internal Server Error' },
//       { status: 500 }
//     )
//   }
// }

// 🔁 PUT – Update lead by lead_id
export async function PUT(req, { params }) {
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

      // 🔁 Recalculate lead score before update
      const { lead_score, lead_label } = calculateLeadScore(body.values || {})

      const updatedValues = {
        ...body.values,
        Score: lead_score,
        Label: lead_label
      }

      // 📝 Fields to update
      const updateFields = {
        values: updatedValues,
        updatedAt: new Date()
      }

      // 🚀 Include lead_name if provided
      if (body.lead_name) {
        updateFields.lead_name = body.lead_name
      }

      if (body.lead_slug_name) {
        updateFields.lead_slug_name = body.lead_slug_name
      }

      // 🚀 Include form_name if provided
      if (body.form_name) {
        updateFields.form_name = body.form_name
      }

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

// PATCH – Add Note to Lead
// export async function PATCH(req, { params }) {
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

//       // pick first note from body.values.Notes
//       const noteFromBody = body.values?.Notes?.[0] || {}

//       const newNote = {
//         title: noteFromBody.title || null,
//         note: noteFromBody.note || null,
//         createdAt: noteFromBody.createdAt ? new Date(noteFromBody.createdAt) : new Date(),
//         createdBy: noteFromBody.createdBy || null,
//       }

//       const updated = await Leadform.findOneAndUpdate(
//         { lead_id },
//         {
//           $push: { 'values.Notes': newNote },
//           $set: { updatedAt: new Date() }
//         },
//         { new: true, upsert: true }
//       )

//       return NextResponse.json({
//         success: true,
//         message: 'Added successfully',
//         data: updated
//       })
//     } catch (error) {
//       console.error('⨯ Add note error:', error)
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

// export async function PATCH(req, { params }) {
//   const verified = verifyAccessToken()
//   await connectMongoDB()
//   const { lead_id } = params
//   const body = await req.json()

//   if (verified.success) {
//     try {
//       const lead = await Leadform.findOne({ lead_id })
//       if (!lead) {
//         return NextResponse.json(
//           { success: false, message: 'Lead not found' },
//           { status: 404 }
//         )
//       }

//       // Note pick
//       const noteFromBody = body.values?.Notes?.[0] || {}

//       console.log(noteFromBody,"<<<NOTES FROM BODY")
//       const newNote = {
//         title: noteFromBody.title || null,
//         note: noteFromBody.note || null,
//         createdAt: noteFromBody.createdAt
//           ? new Date(noteFromBody.createdAt)
//           : new Date(),
//         createdBy: noteFromBody.createdBy || null,
//       }

//       // Activity → Task pick
//       const activityFromBody = body.values?.Activity?.[0] || {}
//       const taskFromBody = activityFromBody.task?.[0] || {}
//       console.log(taskFromBody,"<<<TASKS FROM BODY")
//       const newTask = {
//         subject: taskFromBody.subject || null,
//         dueDate: taskFromBody.dueDate ? new Date(taskFromBody.dueDate) : null,
//         priority: taskFromBody.priority || null,
//         owner: taskFromBody.owner || null,
//         reminderEnabled: !!taskFromBody.reminderEnabled,
//         reminderDate: taskFromBody.reminderDate
//           ? new Date(taskFromBody.reminderDate)
//           : null,
//         reminderTime: taskFromBody.reminderTime || null,
//         alertType: taskFromBody.alertType || 'Email',
//         createdAt: new Date(),
//       }

//       // If no Activity array exist → create one
//       if (!lead.values?.Activity || lead.values.Activity.length === 0) {
//         lead.values.Activity = [{ task: [] }]
//       }

//       // Push into Notes + Activity.0.task
//       const updated = await Leadform.findOneAndUpdate(
//         { lead_id },
//         {
//           $push: {
//             'values.Notes': newNote,
//             'values.Activity.0.task': newTask,
//           },
//           $set: { updatedAt: new Date() },
//         },
//         { new: true, upsert: true }
//       )

//       return NextResponse.json({
//         success: true,
//         message: 'Note & Activity Task added successfully',
//         data: updated,
//       })
//     } catch (error) {
//       console.error('⨯ Add note+activity error:', error)
//       return NextResponse.json(
//         { success: false, message: 'Internal Server Error' },
//         { status: 500 }
//       )
//     }
//   } else {
//     return NextResponse.json(
//       {
//         success: false,
//         message: '',
//         error: 'token expired!',
//       },
//       { status: 400 }
//     )
//   }
// }

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
      console.log(noteFromBody, '<<<NOTES FROM BODY')

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
      console.log(taskFromBody, '<<<TASKS FROM BODY')

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
      const updateQuery = {
        $set: { updatedAt: new Date() }
      }

      if (newNote) {
        updateQuery.$push = { ...(updateQuery.$push || {}), 'values.Notes': newNote }
      }

      if (updateNote) {
        // Update an existing note by its _id
        const updated = await Leadform.findOneAndUpdate(
          { lead_id, 'values.Notes._id': noteFromBody._id }, // match lead + note _id
          {
            $set: {
              'values.Notes.$.title': updateNote.title,
              'values.Notes.$.note': updateNote.note,
              'values.Notes.$.createdAt': updateNote.createdAt,
              'values.Notes.$.createdBy': updateNote.createdBy,
              updatedAt: new Date()
            }
          },
          { new: true }
        )

        return NextResponse.json({
          success: true,
          message: 'Note updated successfully 1',
          data: updated
        })
      }

      if (newTask) {
        // If no Activity array exist → create one
        if (!lead.values?.Activity || lead.values.Activity.length === 0) {
          lead.values.Activity = [{ task: [] }]
          await lead.save()
        }
        updateQuery.$push = { ...(updateQuery.$push || {}), 'values.Activity.0.task': newTask }
      }

      if (updateTask) {
        const updated = await Leadform.findOneAndUpdate(
          {
            lead_id,
            'values.Activity.0.task._id': taskFromBody._id // ensure task exists
          },
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
              updatedAt: new Date()
            }
          },
          {
            arrayFilters: [{ 't._id': new mongoose.Types.ObjectId(taskFromBody._id) }],
            new: true
          }
        )

        return NextResponse.json({
          success: true,
          message: 'Task updated successfully',
          data: updated
        })
      }

      if (!updateQuery.$push) {
        return NextResponse.json({ success: false, message: 'Nothing to update' }, { status: 400 })
      }

      const updated = await Leadform.findOneAndUpdate({ lead_id }, updateQuery, { new: true, upsert: true })

      return NextResponse.json({
        success: true,
        message: 'Note & Activity Task added successfully',
        data: updated
      })
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

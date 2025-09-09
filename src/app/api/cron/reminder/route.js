// File: app/api/cron/reminder/route.js

import { NextResponse } from 'next/server'
import connectMongoDB from '@/libs/mongodb'
import Leadform from '@/models/Leadform'
import { DateTime } from 'luxon' // Make sure to install: npm install luxon

export async function GET(req) {
  await connectMongoDB()

  const { searchParams } = new URL(req.url)
  const organization_id = searchParams.get('organization_id')

  if (!organization_id) {
    return NextResponse.json(
      { success: false, message: 'organization_id missing' },
      { status: 400 }
    )
  }

  // Current IST time
  const nowIST = DateTime.now().setZone('Asia/Kolkata')
  const nowDate = nowIST.toFormat('yyyy-MM-dd') // YYYY-MM-DD
  const nowTime = nowIST.toFormat('HH:mm')      // HH:mm

  const leads = await Leadform.find({
    organization_id,
    'values.Activity.task.reminderEnabled': true
  }).lean()

  let dueReminders = []

  leads.forEach(lead => {
    const tasks = lead.values?.Activity?.[0]?.task || []

    tasks.forEach(task => {
      if (task.reminderEnabled && task.reminderDate && task.reminderTime) {
        // Combine reminderDate + reminderTime and convert to IST
        const [hours, minutes] = task.reminderTime.split(':').map(Number)
        const reminderDateTime = DateTime.fromJSDate(new Date(task.reminderDate))
          .setZone('Asia/Kolkata')
          .set({ hour: hours, minute: minutes })

        const reminderDateStr = reminderDateTime.toFormat('yyyy-MM-dd')
        const reminderTimeStr = reminderDateTime.toFormat('HH:mm')

        console.log(reminderDateStr, '<<< reminderDateStr')
        console.log(nowDate, '<<< nowDate')
        console.log(reminderTimeStr, '<<< reminderTimeStr')
        console.log(nowTime, '<<< nowTime')

        const checkDateTime = {
            reminderDateStr:reminderDateStr,
            nowDate:nowDate,
            reminderTimeStr:reminderTimeStr,
            nowTime:nowTime,
        }

        if (reminderDateStr === nowDate && reminderTimeStr === nowTime) {
          dueReminders.push({
            lead_id: lead.lead_id,
            lead_name: lead.lead_name,
            subject: task.subject,
            alertType: task.alertType,
            owner: task.owner,
            priority: task.priority,
            reminderDate: task.reminderDate,
            reminderTime: task.reminderTime
          })
        }
      }
    })
  })

  return NextResponse.json({
    success: true,
    dueReminders,
    checkDateTime,
    checkedAt: nowIST.toISO() // ISO string in IST
  })
}

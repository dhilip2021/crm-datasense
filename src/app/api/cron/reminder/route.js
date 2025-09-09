import { NextResponse } from 'next/server'
import connectMongoDB from '@/libs/mongodb'
import Leadform from '@/models/Leadform'

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

  const now = new Date()

  // 🔥 Convert to IST (or your timezone)
  const istOffset = 5.5 * 60 * 60 * 1000
  const nowIST = new Date(now.getTime() + istOffset)

  const nowDate = nowIST.toISOString().split('T')[0] // YYYY-MM-DD
  const nowTime = `${nowIST.getHours().toString().padStart(2, '0')}:${nowIST
    .getMinutes()
    .toString()
    .padStart(2, '0')}`

  const leads = await Leadform.find({
    organization_id,
    'values.Activity.task.reminderEnabled': true
  }).lean()

  let dueReminders = []

  

  leads.forEach(lead => {
  const tasks = lead.values?.Activity?.[0]?.task || []

  tasks.forEach(task => {
    if (task.reminderEnabled && task.reminderDate && task.reminderTime) {
      // Combine reminderDate + reminderTime into one Date
      const [hours, minutes] = task.reminderTime.split(':').map(Number)
      const reminderDateTime = new Date(task.reminderDate)
      reminderDateTime.setHours(hours)
      reminderDateTime.setMinutes(minutes)

      // Convert to IST
      const reminderIST = new Date(reminderDateTime.getTime() + istOffset)

      const reminderDateStr = reminderIST.toISOString().split('T')[0]
      const reminderTimeStr = `${reminderIST.getHours().toString().padStart(2,'0')}:${reminderIST.getMinutes().toString().padStart(2,'0')}`

      console.log(reminderDateStr,"<<< reminderDateStr")
      console.log(nowDate,"<<<< nowDate")
      console.log( reminderTimeStr,"<<< reminderTimeStr")
      console.log(nowTime, "<<< nowTime")

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
    checkedAt: nowIST
  })
}

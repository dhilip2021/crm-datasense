import cron from 'node-cron'
import Leadform from '@/models/Leadform'
import connectMongoDB from './mongodb'

// Run every minute
export function startReminderCron() {
  cron.schedule('* * * * *', async () => {
    console.log('⏰ Cron running every minute...')

    try {
      await connectMongoDB()

      // Find tasks with reminder time <= now
      const now = new Date()

      const leads = await Leadform.find({
        'values.Activity.task': {
          $elemMatch: {
            reminderEnabled: true,
            reminderDate: { $lte: now.toISOString().split('T')[0] },
            reminderTime: { $lte: now.toTimeString().slice(0, 5) } // HH:mm format
          }
        }
      })

      if (leads.length > 0) {
        console.log('🔥 Upcoming reminders found:', leads.length)

        // 👉 Here you can:
        // 1. Send push notification
        // 2. Update DB (flag: reminderTriggered=true)
        // 3. Or store in Redis/Queue for frontend
      }
    } catch (err) {
      console.error('Cron Job Error:', err)
    }
  })
}

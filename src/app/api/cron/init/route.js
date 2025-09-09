import { NextResponse } from 'next/server'
import { startReminderCron } from '@/libs/cronJobs'

// Run once when API is hit (good for dev)
let cronStarted = false

export async function GET() {
  if (!cronStarted) {
    startReminderCron()
    cronStarted = true
    console.log('🚀 Reminder Cron Started!')
  }
  return NextResponse.json({ success: true, message: 'Cron is running' })
}

import { NextResponse } from 'next/server'
import connectMongoDB from '@/libs/mongodb'
import LeadTemplate from '@/models/LeadTemplate'
import { verifyAccessToken } from '@/helper/clientHelper'

let sendResponse = {
  appStatusCode: '',
  message: '',
  payloadJson: [],
  error: ''
}

export async function POST(request) {
  const { organization_id, form_name, version, sections } = await request.json()

  const verified = verifyAccessToken()

  if (verified.success) {
    try {
      await connectMongoDB()

      if (!organization_id || organization_id.trim() === '') {
        sendResponse.appStatusCode = 4
        sendResponse.message = ''
        sendResponse.payloadJson = []
        sendResponse.error = 'Please enter organization !'

        return NextResponse.json(sendResponse, { status: 200 })
      }

      const FieldDataSave = new LeadTemplate({
        organization_id,
        form_name,
        version,
        sections
      })

      await FieldDataSave.save() // ✅ Correct way

      sendResponse.appStatusCode = 0
      sendResponse.message = 'Fields form added Successfully!'
      sendResponse.payloadJson = []
      sendResponse.error = []

      return NextResponse.json(sendResponse, { status: 200 })
    } catch (err) {
      console.error('Mongo Save Error:', err) // ✅ Debugging log

      sendResponse.appStatusCode = 4
      sendResponse.message = ''
      sendResponse.payloadJson = []
      sendResponse.error = err.message || 'Something went wrong!'

      return NextResponse.json(sendResponse, { status: 400 })
    }
  } else {
    sendResponse.appStatusCode = 4
    sendResponse.message = ''
    sendResponse.payloadJson = []
    sendResponse.error = 'token expired!'

    return NextResponse.json(sendResponse, { status: 400 })
  }
}

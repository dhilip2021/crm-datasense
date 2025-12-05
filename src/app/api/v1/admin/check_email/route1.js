




import { NextResponse } from 'next/server'
import { User } from '@/models/userModel'
import connectMongoDB from '@/libs/mongodb'
import { decrypCryptoRequest, encryptCryptoResponse } from '@/helper/frontendHelper'

export async function POST(request) {
  let sendResponse = {
    appStatusCode: '',
    message: '',
    payloadJson: [],
    error: ''
  }

  try {
    await connectMongoDB()
    const { email } = await request.json()

    const encEmail = encryptCryptoResponse(email)

    if (!email || email.trim() === '') {
      sendResponse.appStatusCode = 4
      sendResponse.message = 'Please enter valid email!'
      return NextResponse.json(sendResponse, { status: 400 })
    }
     

    // Fetch only necessary fields (optimized, fast)
    const users = await User.find({}, { email: 1, first_name: 1, last_name: 1, user_id: 1 })
    
    let matchedUser = null

    for (const u of users) {
      const decryptedEmail = decrypCryptoRequest(u.email)
     
      if (decryptedEmail === email) {
        matchedUser = { ...u._doc, decryptedEmail }
        break
      }
    }

    if (!matchedUser) {
      sendResponse.appStatusCode = 0
      sendResponse.message = 'User does not exist'
      sendResponse.payloadJson = []
      return NextResponse.json(sendResponse, { status: 200 })
    }

    sendResponse.appStatusCode = 4
    sendResponse.message = 'User already exists!'
    sendResponse.payloadJson = matchedUser

    return NextResponse.json(sendResponse, { status: 409 }) // 409 Conflict
  } catch (err) {
    sendResponse.appStatusCode = 4
    sendResponse.message = 'Something went wrong'
    sendResponse.payloadJson = []
    sendResponse.error = err.message
    return NextResponse.json(sendResponse, { status: 500 })
  }
}

import { NextResponse } from 'next/server'

import { User } from '@/models/userModel'

import connectMongoDB from '@/libs/mongodb'
import { decrypCryptoRequest, encryptCryptoResponse } from '@/helper/frontendHelper'

let sendResponse = {
  appStatusCode: '',
  message: '',
  payloadJson: [],
  error: ''
}

export async function POST(request) {
  const { email } = await request.json()

  try {
    await connectMongoDB()

    // const encEmail = encryptCryptoResponse(email)

    if (email !== '' && email !== undefined) {
      await User.find().then(response => {


        const emailList = response.map(u => {
          return {
            ...u._doc, // full user object
            decryptedEmail: decrypCryptoRequest(u.email)
          }
        })

        console.log(emailList, '<<< MATCHED1111')




        const matched = response.find(u => decrypCryptoRequest(u.email) === email)
        if (!matched) {
          sendResponse['appStatusCode'] = 0
          sendResponse['message'] = 'User Details'
          sendResponse['data'] = ''
          sendResponse['error'] = []
        } else {
          sendResponse['appStatusCode'] = 4
          sendResponse['message'] = 'User Already Exists!!'
          sendResponse['data'] = emailList
          sendResponse['error'] = []
        }
      })
    } else if (email === undefined) {
      sendResponse['appStatusCode'] = 4
      sendResponse['message'] = 'Please check your payload!'
      sendResponse['data'] = ''
      sendResponse['error'] = []
    } else {
      sendResponse['appStatusCode'] = 4
      sendResponse['message'] = 'Please enter valid email!'
      sendResponse['data'] = ''
      sendResponse['error'] = []
    }

    return NextResponse.json(sendResponse, { status: 200 })
  } catch {
    err => {
      sendResponse['appStatusCode'] = 4
      sendResponse['message'] = 'Something went wrong'
      sendResponse['data'] = []
      sendResponse['error'] = err

      return NextResponse.json(sendResponse, { status: 400 })
    }
  }
}

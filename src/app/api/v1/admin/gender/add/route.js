import { NextResponse } from 'next/server'

import connectMongoDB from '@/libs/mongodb'
import { create_UUID, verifyAccessToken } from '@/helper/clientHelper'
import { Gender } from '@/models/genderModel'

let sendResponse = {
  appStatusCode: '',
  message: '',
  payloadJson: [],
  error: ''
}

export async function POST(request) {
  const { gender_name, n_status, Id } = await request.json()

  try {
    await connectMongoDB()
    const verified = verifyAccessToken()

    if (verified.success) {
      if (Id) {
        const genderId = await Gender.findOne({ _id: Id })

        if (genderId === null) {
          sendResponse['appStatusCode'] = 4
          sendResponse['message'] = []
          sendResponse['payloadJson'] = []
          sendResponse['error'] = 'Please enter valid id!'

          return NextResponse.json(sendResponse, { status: 200 })
        } else if (gender_name) {
          const body = {
            gender_name: gender_name
          }

          await Gender.findByIdAndUpdate(Id, body)
            .then(result => {
              sendResponse['appStatusCode'] = 0
              sendResponse['message'] = 'Name Updated Successfully!'
              sendResponse['payloadJson'] = []
              sendResponse['error'] = []
            })
            .catch(err => {
              sendResponse['appStatusCode'] = 4
              sendResponse['message'] = 'Invalid Id'
              sendResponse['payloadJson'] = []
              sendResponse['error'] = err
            })

          return NextResponse.json(sendResponse, { status: 200 })
        } 
          const body = {
            n_status: n_status
          }
          await Gender.findByIdAndUpdate(Id, body)
            .then(result => {
              sendResponse['appStatusCode'] = 0
              sendResponse['message'] = 'Status Updated Successfully!'
              sendResponse['payloadJson'] = []
              sendResponse['error'] = []
            })
            .catch(err => {
              sendResponse['appStatusCode'] = 4
              sendResponse['message'] = 'Invalid Id'
              sendResponse['payloadJson'] = []
              sendResponse['error'] = err
            })
          return NextResponse.json(sendResponse, { status: 200 })
        


        // return NextResponse.json(sendResponse, { status: 200 })
      } else {
        const checkgender = await Gender.findOne({ gender_name: gender_name })

        if (gender_name === '') {
          sendResponse['appStatusCode'] = 4
          sendResponse['message'] = ''
          sendResponse['payloadJson'] = []
          sendResponse['error'] = 'Gender name is required'
          return NextResponse.json(sendResponse, { status: 200 })
        } else if (checkgender !== null) {
          sendResponse['appStatusCode'] = 4
          sendResponse['message'] = []
          sendResponse['payloadJson'] = []
          sendResponse['error'] = 'Gender already exist'
          return NextResponse.json(sendResponse, { status: 200 })
        } else {
          const body = {
            gender_id: create_UUID(),
            gender_name: gender_name,
            c_createdBy: verified.data.user_id
          }

          const GenderData = new Gender(body)

          await GenderData.save()
            .then(result => {
              sendResponse['appStatusCode'] = 0
              sendResponse['message'] = 'Gender created Successfully'
              sendResponse['payloadJson'] = result
              sendResponse['error'] = []
            })
            .catch(err => {
              sendResponse['appStatusCode'] = 4
              sendResponse['message'] = ''
              sendResponse['payloadJson'] = []
              sendResponse['error'] = err
            })

          return NextResponse.json(sendResponse, { status: 200 })
        }
      }
    } else {
      sendResponse['appStatusCode'] = 4
      sendResponse['message'] = ''
      sendResponse['payloadJson'] = []
      sendResponse['error'] = verified.error

      return NextResponse.json(sendResponse, { status: 400 })
    }
  } catch (err) {
    sendResponse['appStatusCode'] = 4
    sendResponse['message'] = 'Error'
    sendResponse['payloadJson'] = []
    sendResponse['error'] = 'Something went wrong!'

    return NextResponse.json(sendResponse, { status: 400 })
  }
}

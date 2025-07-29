import { NextResponse } from 'next/server'

import connectMongoDB from '@/libs/mongodb'
import { create_UUID, verifyAccessToken } from '@/helper/helper'
import { Salutation } from '@/models/salutationModel'

let sendResponse = {
  appStatusCode: '',
  message: '',
  payloadJson: [],
  error: ''
}

export async function POST(request) {
  const { salutation_name, n_status, n_published, Id } = await request.json()

  try {
    await connectMongoDB()
    const verified = verifyAccessToken()

    if (verified.success) {
      if (Id) {
        const salutationId = await Salutation.findOne({ _id: Id })

        if (salutationId === null) {
          sendResponse['appStatusCode'] = 4
          sendResponse['message'] = []
          sendResponse['payloadJson'] = []
          sendResponse['error'] = 'Please enter valid id!'

          return NextResponse.json(sendResponse, { status: 200 })
        } else if (salutation_name) {
          const body = {
            salutation_name: salutation_name
          }

          await Salutation.findByIdAndUpdate(Id, body)
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
          await Salutation.findByIdAndUpdate(Id, body)
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
        const checksalutation = await Salutation.findOne({ salutation_name: salutation_name })

        if (salutation_name === '') {
          sendResponse['appStatusCode'] = 4
          sendResponse['message'] = ''
          sendResponse['payloadJson'] = []
          sendResponse['error'] = 'Salutation name is required'
          return NextResponse.json(sendResponse, { status: 200 })
        } else if (checksalutation !== null) {
          sendResponse['appStatusCode'] = 4
          sendResponse['message'] = []
          sendResponse['payloadJson'] = []
          sendResponse['error'] = 'Salutation already exist'
          return NextResponse.json(sendResponse, { status: 200 })
        } else {
          const body = {
            salutation_id: create_UUID(),
            salutation_name: salutation_name,
            c_createdBy: verified.data.user_id
          }

          const SalutationData = new Salutation(body)

          await SalutationData.save()
            .then(result => {
              sendResponse['appStatusCode'] = 0
              sendResponse['message'] = 'Salutation created Successfully'
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

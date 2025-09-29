import { NextResponse } from 'next/server'

import connectMongoDB from '@/libs/mongodb'
import { create_UUID, verifyAccessToken } from '@/helper/clientHelper'
import { UOMMaster } from '@/models/UOMMaster'

let sendResponse = {
  appStatusCode: '',
  message: '',
  payloadJson: [],
  error: ''
}

export async function POST(request) {
  const { uom_code,uom_label, Id, n_status } = await request.json()

  const verified = verifyAccessToken()
  const organizationId = verified?.data?.organization_id

  console.log(verified,"<< verified")

  if (verified.success) {
    try {
      await connectMongoDB()

      if (Id) {
        const UomId = await UOMMaster.findOne({
          _id: Id
        })

        if (UomId === null) {
          sendResponse['appStatusCode'] = 4
          sendResponse['message'] = []
          sendResponse['payloadJson'] = []
          sendResponse['error'] = 'Please enter valid id!'
          return NextResponse.json(sendResponse, { status: 200 })
        } else {
          const body = {
            uom_code: uom_code,
            uom_label: uom_label,            
            n_status: n_status
          }
          await UOMMaster.findByIdAndUpdate(Id, body)
            .then(() => {
              sendResponse['appStatusCode'] = 0
              sendResponse['message'] = 'Updated Successfully!'
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
      } else {
        const uomValue = await UOMMaster.findOne({
          uom_code: uom_code,
          uom_label: uom_label,
          organization_id: organizationId
        })
        if (uom_code === '') {
          sendResponse['appStatusCode'] = 4
          sendResponse['message'] = []
          sendResponse['payloadJson'] = []
          sendResponse['error'] = 'Please enter uom code!'
          return NextResponse.json(sendResponse, { status: 200 })
        } else if (uomValue) {
          sendResponse['appStatusCode'] = 4
          sendResponse['message'] = []
          sendResponse['payloadJson'] = []
          sendResponse['error'] = ' UOM value already exist'

          return NextResponse.json(sendResponse, { status: 200 })
        } else {
          let uomValue = new UOMMaster({
            uom_id: create_UUID(),
            organization_id: organizationId,
            uom_code,
            uom_label,
            c_createdBy: verified.data.user_id
          })

          await uomValue
            .save()
            .then(() => {
              sendResponse['appStatusCode'] = 0
              sendResponse['message'] = 'UOM Value added Successfully!'
              sendResponse['payloadJson'] = []
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
    } catch (err) {
      sendResponse['appStatusCode'] = 4
      sendResponse['message'] = ''
      sendResponse['payloadJson'] = []
      sendResponse['error'] = 'Something went wrong!'

      return NextResponse.json(sendResponse, { status: 400 })
    }
  } else {
    sendResponse = {
      appStatusCode: 4,
      message: [],
      payloadJson: [],
      error: verified.error
    }
    return NextResponse.json(sendResponse, { status: 400 })
  }
}

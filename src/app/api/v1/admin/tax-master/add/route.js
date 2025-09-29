import { NextResponse } from 'next/server'

import connectMongoDB from '@/libs/mongodb'
import { create_UUID, verifyAccessToken } from '@/helper/clientHelper'
import { TaxMaster } from '@/models/taxMasterModel'

let sendResponse = {
  appStatusCode: '',
  message: '',
  payloadJson: [],
  error: ''
}

export async function POST(request) {
  const { tax_value, Id, n_status } = await request.json()

  const verified = verifyAccessToken()

    console.log(verified?.data?.organization_id,"<<< VERIFIEDDDDD")
const organizationId = verified?.data?.organization_id

  if (verified.success) {

       try {
      await connectMongoDB()

      if (Id) {
        const taxId = await TaxMaster.findOne({
          _id: Id
        })

        if (taxId === null) {
          sendResponse['appStatusCode'] = 4
          sendResponse['message'] = []
          sendResponse['payloadJson'] = []
          sendResponse['error'] = 'Please enter valid id!'
          return NextResponse.json(sendResponse, { status: 200 })
        } else {
          const body = {
            tax_value: tax_value,
            n_status: n_status
          }
          await TaxMaster.findByIdAndUpdate(Id, body)
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
        const taxValue = await TaxMaster.findOne({
          tax_value: tax_value,
          organization_id: organizationId
        })
        if (tax_value === '') {
          sendResponse['appStatusCode'] = 4
          sendResponse['message'] = []
          sendResponse['payloadJson'] = []
          sendResponse['error'] = 'Please enter tax value!'
          return NextResponse.json(sendResponse, { status: 200 })
        } else if (taxValue) {
          sendResponse['appStatusCode'] = 4
          sendResponse['message'] = []
          sendResponse['payloadJson'] = []
          sendResponse['error'] = ' Tax value already exist'

          return NextResponse.json(sendResponse, { status: 200 })
        } else {

          let taxValue = new TaxMaster({
            tax_id: create_UUID(),
            organization_id: organizationId,
            tax_value,
            c_createdBy: verified.data.user_id,
          })

          await taxValue
            .save()
            .then(() => {
              sendResponse['appStatusCode'] = 0
              sendResponse['message'] = 'Tax Value added Successfully!'
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

import { NextResponse } from 'next/server'

import connectMongoDB from '@/libs/mongodb'
import { create_UUID, verifyAccessToken } from '@/helper/clientHelper'
import { CategoryMaster } from '@/models/categoryMasterModel'


let sendResponse = {
  appStatusCode: '',
  message: '',
  payloadJson: [],
  error: ''
}

export async function POST(request) {
  const { category_type,prod_name, Id, n_status } = await request.json()

  const verified = verifyAccessToken()

const organizationId = verified?.data?.organization_id

  if (verified.success) {

       try {
      await connectMongoDB()

      if (Id) {
        const categoryId = await CategoryMaster.findOne({
          _id: Id
        })

        if (categoryId === null) {
          sendResponse['appStatusCode'] = 4
          sendResponse['message'] = []
          sendResponse['payloadJson'] = []
          sendResponse['error'] = 'Please enter valid id!'
          return NextResponse.json(sendResponse, { status: 200 })
        } else {
          const body = {
            prod_name: prod_name,
            n_status: n_status
          }
          await CategoryMaster.findByIdAndUpdate(Id, body)
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
        const categoryValue = await CategoryMaster.findOne({
          category_type: category_type,
          prod_name: prod_name,
          organization_id: organizationId
        })
        if (prod_name === '') {
          sendResponse['appStatusCode'] = 4
          sendResponse['message'] = []
          sendResponse['payloadJson'] = []
          sendResponse['error'] = 'Please enter category value!'
          return NextResponse.json(sendResponse, { status: 200 })
        } else if (categoryValue) {
          sendResponse['appStatusCode'] = 4
          sendResponse['message'] = []
          sendResponse['payloadJson'] = []
          sendResponse['error'] = ' Category value already exist'

          return NextResponse.json(sendResponse, { status: 200 })
        } else {

          let categoryValue = new CategoryMaster({
            prod_id: create_UUID(),
            organization_id: organizationId,
            category_type,
            prod_name,
            c_createdBy: verified.data.user_id,
          })

          await categoryValue
            .save()
            .then(() => {
              sendResponse['appStatusCode'] = 0
              sendResponse['message'] = 'Category Value added Successfully!'
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

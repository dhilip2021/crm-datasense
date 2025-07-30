import { NextResponse } from 'next/server'

import slugify from 'slugify'

import connectMongoDB from '@/libs/mongodb'
import { create_UUID, verifyAccessToken } from '@/helper/clientHelper'
import { Customer } from '@/models/customerModel'

let sendResponse = {
  appStatusCode: '',
  message: '',
  payloadJson: [],
  error: ''
}

export async function POST(request) {
  const {
    customer_name,
    customer_type,
    salutation,
    gender,
    territory_id,
    lead_id,
    opportunity_id,
    prospect_id,
    account_manager_id,
    billing_currency_id,
    price_list_id,
    bank_account_id,
    Id
  } = await request.json()

  try {
    await connectMongoDB()
    const verified = verifyAccessToken()

    if (verified.success) {
      if (Id) {
        const customerId = await Customer.findOne({
          _id: Id
        })

        if (customerId === null) {
          sendResponse['appStatusCode'] = 4
          sendResponse['message'] = []
          sendResponse['payloadJson'] = []
          sendResponse['error'] = 'Please enter valid id!'

          return NextResponse.json(sendResponse, { status: 200 })
        } else {
          const body = {
            customer_name: customer_name,
            customer_type: customer_type,
            territory_id: territory_id,
            lead_id: lead_id,
            opportunity_id: opportunity_id,
            prospect_id: prospect_id,
            account_manager_id: account_manager_id,
            billing_currency_id: billing_currency_id,
            price_list_id: price_list_id,
            bank_account_id: bank_account_id
          }

          await Customer.findByIdAndUpdate(Id, body)
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
        if (customer_name === '') {
          sendResponse['appStatusCode'] = 4
          sendResponse['message'] = ''
          sendResponse['payloadJson'] = []
          sendResponse['error'] = 'Customer name is required'
          return NextResponse.json(sendResponse, { status: 200 })
        }

        const body = {
          customer_id: create_UUID(),
          customer_name: customer_name,
          customer_type: customer_type,
          salutation: salutation ? salutation : "",
          gender: gender ? gender :"",
          territory_id: territory_id ? territory_id : "",
          lead_id: lead_id ? lead_id : "",
          opportunity_id: opportunity_id ? opportunity_id : "",
          prospect_id: prospect_id ? prospect_id : "",
          account_manager_id: account_manager_id ? account_manager_id : "",
          billing_currency_id: billing_currency_id ? billing_currency_id : "",
          price_list_id: price_list_id ? price_list_id : "",
          bank_account_id: bank_account_id ? bank_account_id :"",
          c_createdBy: verified.data.user_id
        }

        const CustomerData = new Customer(body)

        await CustomerData.save()
          .then(result => {
            sendResponse['appStatusCode'] = 0
            sendResponse['message'] = 'Customer created Successfully'
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

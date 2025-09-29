import { NextResponse } from 'next/server'

import connectMongoDB from '@/libs/mongodb'
import { create_UUID, verifyAccessToken } from '@/helper/clientHelper'
import { ItemMaster } from '@/models/ItemMasterModel'

let sendResponse = {
  appStatusCode: '',
  message: '',
  payloadJson: [],
  error: ''
}

export async function POST(request) {
  const {
    item_code,
    item_name,
    item_type,
    description,
    uom,
    basePrice,
    gst,
    mrp,
    distributorPrice,
    hsn,
    licenseKey,
    warrantyPeriod,
    billingCycle,
    subscriptionDuration,
    Id,
    n_status
  } = await request.json()

  const verified = verifyAccessToken()
  const organizationId = verified?.data?.organization_id

  if (verified.success) {
    try {
      await connectMongoDB()

      if (Id) {
        const ItemId = await ItemMaster.findOne({
          _id: Id
        })

        if (ItemId === null) {
          sendResponse['appStatusCode'] = 4
          sendResponse['message'] = []
          sendResponse['payloadJson'] = []
          sendResponse['error'] = 'Please enter valid id!'
          return NextResponse.json(sendResponse, { status: 200 })
        } else {
          const body = {
            item_code: item_code,
            item_name: item_name,
            item_type,
            description: description ? description : '',
            uom: uom ? uom : '',
            basePrice: basePrice ? basePrice : '',
            gst: gst ? gst : '',
            mrp: mrp ? mrp : '',
            distributorPrice: distributorPrice ? distributorPrice : '',
            hsn: hsn ? hsn : '',
            licenseKey: licenseKey ? licenseKey : '',
            warrantyPeriod: warrantyPeriod ? warrantyPeriod : '',
            billingCycle: billingCycle ? billingCycle : '',
            subscriptionDuration: subscriptionDuration ? subscriptionDuration : '',
            n_status: n_status
          }
          await ItemMaster.findByIdAndUpdate(Id, body)
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
        const uomValue = await ItemMaster.findOne({
          organization_id: organizationId,
          item_name: item_name,
        })
        if (item_code === '') {
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
          let uomValue = new ItemMaster({
            item_id: create_UUID(),
            organization_id: organizationId,
            item_code,
            item_name,
            item_type,
            description: description ? description : '',
            uom: uom ? uom : '',
            basePrice: basePrice ? basePrice : '',
            gst: gst ? gst : '',
            mrp: mrp ? mrp : '',
            distributorPrice: distributorPrice ? distributorPrice : '',
            hsn: hsn ? hsn : '',
            licenseKey: licenseKey ? licenseKey : '',
            warrantyPeriod: warrantyPeriod ? warrantyPeriod : '',
            billingCycle: billingCycle ? billingCycle : '',
            subscriptionDuration: subscriptionDuration ? subscriptionDuration : '',
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

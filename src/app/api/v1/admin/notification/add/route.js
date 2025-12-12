import { NextResponse } from 'next/server'

import connectMongoDB from '@/libs/mongodb'
import { create_UUID, verifyAccessToken } from '@/helper/clientHelper'
import { Notification } from '@/models/notificationModel'

let sendResponse = {
  appStatusCode: '',
  message: '',
  payloadJson: [],
  error: ''
}

export async function POST(request) {
  let data = await request.json()

  try {
    await connectMongoDB()
    const verified = verifyAccessToken()

    if (!verified.success) {
      return NextResponse.json(
        {
          appStatusCode: 4,
          message: '',
          payloadJson: [],
          error: verified.error
        },
        { status: 400 }
      )
    }

    // -------------------------------
    //  UPDATE LOGIC
    // -------------------------------
    if (data.Id) {
      const notifyId = await Notification.findById(data.Id)

      if (!notifyId) {
        return NextResponse.json(
          {
            appStatusCode: 4,
            message: [],
            payloadJson: [],
            error: 'Please enter valid id!'
          },
          { status: 200 }
        )
      }

      // Update Read Status
      if (data.c_send_to) {
        try {
          await Notification.findByIdAndUpdate(data.Id, {
            c_send_to: data.c_send_to
          })

          return NextResponse.json(
            {
              appStatusCode: 0,
              message: 'Read Status Updated Successfully!',
              payloadJson: [],
              error: []
            },
            { status: 200 }
          )
        } catch (err) {
          return NextResponse.json(
            {
              appStatusCode: 4,
              message: 'Invalid Id',
              payloadJson: [],
              error: err
            },
            { status: 200 }
          )
        }
      }

      // Update Notification Status
      if (data.n_status) {
        try {
          await Notification.findByIdAndUpdate(data.Id, {
            n_status: data.n_status
          })

          return NextResponse.json(
            {
              appStatusCode: 0,
              message: 'Status Updated Successfully!',
              payloadJson: [],
              error: []
            },
            { status: 200 }
          )
        } catch (err) {
          return NextResponse.json(
            {
              appStatusCode: 4,
              message: 'Invalid Id',
              payloadJson: [],
              error: err
            },
            { status: 200 }
          )
        }
      }
    }

    // -------------------------------
    //  CREATE NOTIFICATIONS
    // -------------------------------

    // -------------------------------
    //  CREATE NOTIFICATIONS (NO DUPLICATES)
    // -------------------------------

    // CASE 1: Array Payload
    if (Array.isArray(data)) {
      const savedList = []

      for (const item of data) {
        // Check duplicates
        const exists = await Notification.findOne({
          c_title: item.c_title,
          c_message: item.c_message,
          c_send_to: item.c_send_to,
          c_type: item.c_type,
          c_link: item.c_link
        })

        if (exists) {
          continue // skip duplicates
        }

        const body = {
          c_notification_id: create_UUID(),
          c_title: item.c_title,
          c_message: item.c_message,
          c_icon: item.c_icon,
          c_link: item.c_link,
          c_type: item.c_type,
          c_send_to: item.c_send_to,
          c_createdBy: verified.data.user_id
        }

        const notifyData = new Notification(body)
        const saved = await notifyData.save()
        savedList.push(saved)
      }

      return NextResponse.json(
        {
          appStatusCode: 0,
          message: 'Notifications saved Successfully',
          payloadJson: savedList,
          error: []
        },
        { status: 200 }
      )
    }

    // CASE 2: Single Payload
    if (!data.c_title || !data.c_message) {
      return NextResponse.json(
        {
          appStatusCode: 4,
          message: '',
          payloadJson: [],
          error: 'Title and message are required'
        },
        { status: 200 }
      )
    }

    // Check duplicate for single
    const existing = await Notification.findOne({
      c_title: data.c_title,
      c_message: data.c_message,
      c_send_to: data.c_send_to,
      c_type: data.c_type,
      c_link: data.c_link
    })

    if (existing) {
      return NextResponse.json(
        {
          appStatusCode: 4,
          message: 'Duplicate notification found',
          payloadJson: [],
          error: []
        },
        { status: 200 }
      )
    }

    const body = {
      c_notification_id: create_UUID(),
      c_title: data.c_title,
      c_message: data.c_message,
      c_icon: data.c_icon,
      c_link: data.c_link,
      c_type: data.c_type,
      c_send_to: data.c_send_to,
      c_createdBy: verified.data.user_id
    }

    const NotifyData = new Notification(body)
    const result = await NotifyData.save()

    return NextResponse.json(
      {
        appStatusCode: 0,
        message: 'Notification saved Successfully',
        payloadJson: result,
        error: []
      },
      { status: 200 }
    )
  } catch (err) {
    if (err.code === 11000) {
      return NextResponse.json({
        appStatusCode: 4,
        message: 'Duplicate notification',
        payloadJson: [],
        error: err
      })
    }

    return NextResponse.json({
      appStatusCode: 4,
      message: 'Something went wrong',
      payloadJson: [],
      error: err
    })
  }
}

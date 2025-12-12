import { NextResponse } from 'next/server'
import connectMongoDB from '@/libs/mongodb'
import { verifyAccessToken } from '@/helper/clientHelper'
import { Notification } from '@/models/notificationModel'

let sendResponse = {
  appStatusCode: '',
  message: '',
  payloadJson: [],
  error: ''
}

export async function GET(request) {
  const verified = verifyAccessToken()
  const id = request.nextUrl.searchParams.get('id')
  const c_user_id = request.nextUrl.searchParams.get('c_user_id')
  const c_read_status = request.nextUrl.searchParams.get('c_read_status')

  if (verified.success) {
    if (id) {
      const checkId = await Notification.findOne({ c_notification_id: id })

      if (checkId) {
        let _search = {}

        _search['$and'] = [
          {
            $and: [{ n_published: 1 }, { c_notification_id: id }]
          }
        ]

        try {
          await connectMongoDB()

          await Notification.aggregate([
            { $match: _search },
            {
              $group: {
                _id: '$_id',
                c_notification_id: { $first: '$c_notification_id' },
                c_title: { $first: '$c_title' },
                c_message: { $first: '$c_message' },
                c_icon: { $first: '$c_icon' },
                c_link: { $first: '$c_link' },
                c_type: { $first: '$c_type' },
                c_send_to: { $first: '$c_send_to' }
              }
            },
            {
              $project: {
                _id: 1,
                c_notification_id: 1,
                c_title: 1,
                c_message: 1,
                c_icon: 1,
                c_link: 1,
                c_type: 1,
                c_send_to: 1,
                createdAt: 1,
                c_createdBy: 1,
                n_status: 1,
                n_published: 1
              }
            },
            {
              $sort: { createdAt: 1 }
            }
          ])
            .then(data => {
              if (data.length > 0) {
                sendResponse['appStatusCode'] = 0
                sendResponse['message'] = ''
                sendResponse['payloadJson'] = data
                sendResponse['error'] = []
              } else {
                sendResponse['appStatusCode'] = 4
                sendResponse['message'] = 'Record not found!'
                sendResponse['payloadJson'] = []
                sendResponse['error'] = []
              }
            })
            .catch(err => {
              sendResponse['appStatusCode'] = 4
              sendResponse['message'] = ''
              sendResponse['payloadJson'] = []
              sendResponse['error'] = err
            })

          return NextResponse.json(sendResponse, { status: 200 })
        } catch (err) {
          sendResponse['appStatusCode'] = 4
          sendResponse['message'] = ''
          sendResponse['payloadJson'] = []
          sendResponse['error'] = 'Something went wrong!'

          return NextResponse.json(sendResponse, { status: 400 })
        }
      } else {
        sendResponse['appStatusCode'] = 4
        sendResponse['message'] = ''
        sendResponse['payloadJson'] = []
        sendResponse['error'] = 'Record not found!!'

        return NextResponse.json(sendResponse, { status: 200 })
      }
    } else if (c_user_id !== "" && c_read_status !== undefined) {
  try {
    await connectMongoDB();

    const pipeline = [
      {
        $match: {
          n_published: 1,
          c_send_to: {
            $elemMatch: {
              c_user_id: c_user_id,
              c_read_status: Number(c_read_status)
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          c_notification_id: 1,
          c_title: 1,
          c_message: 1,
          c_icon: 1,
          c_link: 1,
          c_type: 1,
          c_send_to: 1,
          createdAt: 1,
          c_createdBy: 1,
          n_status: 1,
          n_published: 1
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ];

    const data = await Notification.aggregate(pipeline);

    if (data.length > 0) {
      return NextResponse.json(
        {
          appStatusCode: 0,
          message: "",
          payloadJson: data,
          error: []
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          appStatusCode: 4,
          message: "Record not found!",
          payloadJson: [],
          error: []
        },
        { status: 200 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      {
        appStatusCode: 4,
        message: "",
        payloadJson: [],
        error: "Something went wrong!"
      },
      { status: 400 }
    );
  }
}
 else {
      let _search = {}

      _search['$and'] = [
        {
          $and: [{ n_published: 1 }]
        }
      ]

      try {
        await connectMongoDB()

        await Notification.aggregate([
          { $match: _search },
          {
            $group: {
              _id: '$_id',
              c_notification_id: { $first: '$c_notification_id' },
              c_title: { $first: '$c_title' },
              c_message: { $first: '$c_message' },
              c_icon: { $first: '$c_icon' },
              c_link: { $first: '$c_link' },
              c_type: { $first: '$c_type' },
              c_send_to: { $first: '$c_send_to' }
            }
          },
          {
            $project: {
              _id: 1,
              c_notification_id: 1,
              c_title: 1,
              c_message: 1,
              c_icon: 1,
              c_link: 1,
              c_type: 1,
              c_send_to: 1,
              createdAt: 1,
              c_createdBy: 1,
              n_status: 1,
              n_published: 1
            }
          },
          {
            $sort: { createdAt: 1 }
          }
        ])
          .then(data => {
            if (data.length > 0) {
              sendResponse['appStatusCode'] = 0
              sendResponse['message'] = ''
              sendResponse['payloadJson'] = data
              sendResponse['error'] = []
            } else {
              sendResponse['appStatusCode'] = 0
              sendResponse['message'] = 'Record not found!'
              sendResponse['payloadJson'] = []
              sendResponse['error'] = []
            }
          })
          .catch(err => {
            sendResponse['appStatusCode'] = 4
            sendResponse['message'] = ''
            sendResponse['payloadJson'] = []
            sendResponse['error'] = err
          })

        return NextResponse.json(sendResponse, { status: 200 })
      } catch (err) {
        sendResponse['appStatusCode'] = 4
        sendResponse['message'] = ''
        sendResponse['payloadJson'] = []
        sendResponse['error'] = 'Something went wrong!'

        return NextResponse.json(sendResponse, { status: 400 })
      }
    }
  } else {
    sendResponse['appStatusCode'] = 4
    sendResponse['message'] = ''
    sendResponse['payloadJson'] = []
    sendResponse['error'] = 'token expired!'

    return NextResponse.json(sendResponse, { status: 400 })
  }
}

export async function POST(request) {
  const { c_user_id, c_read_status, n_limit, n_page, c_search_term } = await request.json()

  let searchTerm = c_search_term ? c_search_term : ''
  let n_limitTerm = n_limit
  let n_pageTerm = n_page === 1 ? 0 : (n_page - 1) * n_limit

  if (searchTerm !== '') {
    let _search = {}

    _search['$and'] = [
      {
        $and: [{ n_published: 1 }],
        $or: [{ c_title: { $regex: searchTerm, $options: 'i' } }]
      }
    ]

    try {
      await connectMongoDB()

      await Notification.aggregate([
        { $match: _search },
        {
          $group: {
            _id: '$_id',
            c_notification_id: { $first: '$c_notification_id' },
            c_title: { $first: '$c_title' },
            c_message: { $first: '$c_message' },
            c_icon: { $first: '$c_icon' },
            c_link: { $first: '$c_link' },
            c_type: { $first: '$c_type' },
            c_send_to: { $first: '$c_send_to' }
          }
        },
        {
          $project: {
            _id: 1,
            c_notification_id: 1,
            c_title: 1,
            c_message: 1,
            c_icon: 1,
            c_link: 1,
            c_type: 1,
            c_send_to: 1,
            createdAt: 1,
            c_createdBy: 1,
            n_status: 1,
            n_published: 1
          }
        },
        {
          $sort: { createdAt: -1 }
        },
        {
          $facet: {
            data: [{ $skip: n_pageTerm }, { $limit: n_limitTerm }],
            total_count: [
              {
                $count: 'count'
              }
            ]
          }
        }
      ])
        .then(data => {
          if (data.length > 0) {
            sendResponse['appStatusCode'] = 0
            sendResponse['message'] = ''
            sendResponse['payloadJson'] = data
            sendResponse['error'] = []
          } else {
            sendResponse['appStatusCode'] = 0
            sendResponse['message'] = 'Record not found!'
            sendResponse['payloadJson'] = []
            sendResponse['error'] = []
          }
        })
        .catch(err => {
          sendResponse['appStatusCode'] = 4
          sendResponse['message'] = ''
          sendResponse['payloadJson'] = []
          sendResponse['error'] = err
        })

      return NextResponse.json(sendResponse, { status: 200 })
    } catch (err) {
      sendResponse['appStatusCode'] = 4
      sendResponse['message'] = ''
      sendResponse['payloadJson'] = []
      sendResponse['error'] = 'Something went wrong!'

      return NextResponse.json(sendResponse, { status: 400 })
    }
  } else {
    let _search = {}
    if (c_user_id !== '' && c_read_status !== undefined) {
      _search['$and'] = [
        {
          $and: [
            {
              n_published: 1,
              c_send_to: {
                $elemMatch: {
                  c_user_id: c_user_id,
                  c_read_status: c_read_status
                }
              }
            }
          ]
        }
      ]

      try {
        await connectMongoDB()

        await Notification.aggregate([
          { $match: _search },
          {
            $group: {
              _id: '$_id',
              c_notification_id: { $first: '$c_notification_id' },
              c_title: { $first: '$c_title' },
              c_message: { $first: '$c_message' },
              c_icon: { $first: '$c_icon' },
              c_link: { $first: '$c_link' },
              c_type: { $first: '$c_type' },
              c_send_to: { $first: '$c_send_to' }
            }
          },
          {
            $project: {
              _id: 1,
              c_notification_id: 1,
              c_title: 1,
              c_message: 1,
              c_icon: 1,
              c_link: 1,
              c_type: 1,
              c_send_to: 1,
              createdAt: 1,
              c_createdBy: 1,
              n_status: 1,
              n_published: 1
            }
          },
          {
            $sort: { createdAt: -1 }
          },
          {
            $facet: {
              data: [{ $skip: n_pageTerm }, { $limit: n_limitTerm }],
              total_count: [
                {
                  $count: 'count'
                }
              ]
            }
          }
        ])
          .then(data => {
            if (data.length > 0) {
              sendResponse['appStatusCode'] = 0
              sendResponse['message'] = ''
              sendResponse['payloadJson'] = data
              sendResponse['error'] = []
            } else {
              sendResponse['appStatusCode'] = 0
              sendResponse['message'] = 'Record not found!'
              sendResponse['payloadJson'] = []
              sendResponse['error'] = []
            }
          })
          .catch(err => {
            sendResponse['appStatusCode'] = 4
            sendResponse['message'] = ''
            sendResponse['payloadJson'] = []
            sendResponse['error'] = err
          })

        return NextResponse.json(sendResponse, { status: 200 })
      } catch (err) {
        sendResponse['appStatusCode'] = 4
        sendResponse['message'] = ''
        sendResponse['payloadJson'] = []
        sendResponse['error'] = 'Something went wrong!'

        return NextResponse.json(sendResponse, { status: 400 })
      }
    } else {
      _search['$and'] = [
        {
          $and: [{ n_published: 1 }]
        }
      ]

      try {
        await connectMongoDB()

        await Notification.aggregate([
          { $match: _search },
          {
            $group: {
              _id: '$_id',
              c_notification_id: { $first: '$c_notification_id' },
              c_title: { $first: '$c_title' },
              c_message: { $first: '$c_message' },
              c_icon: { $first: '$c_icon' },
              c_link: { $first: '$c_link' },
              c_type: { $first: '$c_type' },
              c_send_to: { $first: '$c_send_to' }
            }
          },
          {
            $project: {
              _id: 1,
              c_notification_id: 1,
              c_title: 1,
              c_message: 1,
              c_icon: 1,
              c_link: 1,
              c_type: 1,
              c_send_to: 1,
              createdAt: 1,
              c_createdBy: 1,
              n_status: 1,
              n_published: 1
            }
          },
          {
            $sort: { createdAt: 1 }
          },
          {
            $facet: {
              data: [{ $skip: n_pageTerm }, { $limit: n_limitTerm }],
              total_count: [
                {
                  $count: 'count'
                }
              ]
            }
          }
        ])
          .then(data => {
            if (data.length > 0) {
              sendResponse['appStatusCode'] = 0
              sendResponse['message'] = ''
              sendResponse['payloadJson'] = data
              sendResponse['error'] = []
            } else {
              sendResponse['appStatusCode'] = 0
              sendResponse['message'] = 'Record not found!'
              sendResponse['payloadJson'] = []
              sendResponse['error'] = []
            }
          })
          .catch(err => {
            sendResponse['appStatusCode'] = 4
            sendResponse['message'] = ''
            sendResponse['payloadJson'] = []
            sendResponse['error'] = err
          })

        return NextResponse.json(sendResponse, { status: 200 })
      } catch (err) {
        sendResponse['appStatusCode'] = 4
        sendResponse['message'] = ''
        sendResponse['payloadJson'] = []
        sendResponse['error'] = 'Something went wrong!'

        return NextResponse.json(sendResponse, { status: 400 })
      }
    }
  }
}

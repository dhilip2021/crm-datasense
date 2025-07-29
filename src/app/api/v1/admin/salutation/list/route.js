import { NextResponse } from 'next/server'
import connectMongoDB from '@/libs/mongodb'
import { verifyAccessToken } from '@/helper/helper'
import { Salutation } from '@/models/salutationModel'

let sendResponse = {
  appStatusCode: '',
  message: '',
  payloadJson: [],
  error: ''
}

export async function GET(request) {
  const verified = verifyAccessToken()
  const id = request.nextUrl.searchParams.get('id')

  if (verified.success) {
    if (id) {
      const checkId = await Salutation.findOne({ salutation_id: id })

      if (checkId) {
        let _search = {}

        _search['$and'] = [
          {
            $and: [{ n_status: 1 }, { n_published: 1 }, { salutation_id: id }]
          }
        ]

        try {
          await connectMongoDB()

          await Salutation.aggregate([
            { $match: _search },
            {
              $group: {
                _id: '$_id',
                salutation_id: { $first: '$salutation_id' },
                salutation_name: { $first: '$salutation_name' },
                createdAt: { $first: '$createdAt' },
                c_createdBy: { $first: '$c_createdBy' },
                n_status: { $first: '$n_status' },
                n_published: { $first: '$n_published' }
              }
            },
            {
              $project: {
                _id: 1,
                salutation_id: 1,
                salutation_name: 1,
                createdAt: 1,
                c_createdBy: 1,
                n_status: 1,
                n_published: 1
              }
            },
            {
              $sort: { position: -1 }
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
    } else {
      let _search = {}

      _search['$and'] = [
        {
          $and: [{ n_status: 1 }, { n_published: 1 }]
        }
      ]

      try {
        await connectMongoDB()

        await Salutation.aggregate([
          { $match: _search },
          {
            $group: {
              _id: '$_id',
              salutation_id: { $first: '$salutation_id' },
              salutation_name: { $first: '$salutation_name' },
              createdAt: { $first: '$createdAt' },
              c_createdBy: { $first: '$c_createdBy' },
              n_status: { $first: '$n_status' },
              n_status: { $first: '$n_status' },
              n_published: { $first: '$n_published' }
            }
          },
          {
            $project: {
              _id: 1,
              salutation_id: 1,
              salutation_name: 1,
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
  const { n_limit, n_page, c_search_term } = await request.json()

  let searchTerm = c_search_term ? c_search_term : ''
  let n_limitTerm = n_limit
  let n_pageTerm = n_page === 1 ? 0 : (n_page - 1) * n_limit

  if (searchTerm !== '') {
    let _search = {}

    _search['$and'] = [
      {
        $and: [{ n_status: 1 }, { n_published: 1 }],
        $or: [{ salutation_name: { $regex: searchTerm, $options: 'i' } }]
      }
    ]

    try {
      await connectMongoDB()

      await Salutation.aggregate([
        { $match: _search },
        {
          $group: {
            _id: '$_id',
            salutation_id: { $first: '$salutation_id' },
            salutation_name: { $first: '$salutation_name' }
          }
        },
        {
          $project: {
            _id: 1,
            salutation_id: 1,
            salutation_name: 1,
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

    _search['$and'] = [
      {
        $and: [{ n_status: 1 }, { n_published: 1 }]
      }
    ]

    try {
      await connectMongoDB()

      await Salutation.aggregate([
        { $match: _search },
        {
          $group: {
            _id: '$_id',
            salutation_id: { $first: '$salutation_id' },
            salutation_name: { $first: '$salutation_name' },
            createdAt: { $first: '$createdAt' },
            c_createdBy: { $first: '$c_createdBy' },
            n_status: { $first: '$n_status' },
            n_published: { $first: '$n_published' }
          }
        },
        {
          $project: {
            _id: 1,
            salutation_id: 1,
            salutation_name: 1,
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
  }
}

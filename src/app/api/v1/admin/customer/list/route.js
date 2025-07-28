import { NextResponse } from 'next/server'
import connectMongoDB from '@/libs/mongodb'
import { verifyAccessToken } from '@/helper/helper'
import { Customer } from '@/models/customerModel'

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
      const checkId = await Customer.findOne({ customer_id: id })

      if (checkId) {
        let _search = {}

        _search['$and'] = [
          {
            $and: [{ n_status: 1 }, { n_published: 1 }, { customer_id: id }]
          }
        ]

        try {
          await connectMongoDB()

          await Customer.aggregate([
            { $match: _search },
            {
              $group: {
                _id: '$_id',
                customer_id: { $first: '$customer_id' },
                customer_name: { $first: '$customer_name' },
                customer_type: { $first: '$customer_type' },
                salutation: { $first: '$salutation' },
                gender: { $first: '$gender' },
                territory_id: { $first: '$territory_id' },
                lead_id: { $first: '$lead_id' },
                opportunity_id: { $first: '$opportunity_id' },
                prospect_id: { $first: '$prospect_id' },
                account_manager_id: { $first: '$account_manager_id' },
                billing_currency_id: { $first: '$billing_currency_id' },
                price_list_id: { $first: '$price_list_id' },
                bank_account_id: { $first: '$bank_account_id' },
                createdAt: { $first: '$createdAt' },
                c_createdBy: { $first: '$c_createdBy' },
                n_status: { $first: '$n_status' },
                n_published: { $first: '$n_published' }
              }
            },
            {
              $project: {
                _id: 1,
                customer_id: 1,
                customer_name: 1,
                customer_type: 1,
                salutation: 1,
                gender: 1,
                territory_id: 1,
                lead_id: 1,
                opportunity_id: 1,
                prospect_id: 1,
                account_manager_id: 1,
                billing_currency_id: 1,
                price_list_id: 1,
                bank_account_id: 1,
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

        await Customer.aggregate([
          { $match: _search },
          {
            $group: {
              _id: '$_id',
              customer_name: { $first: '$customer_name' },
              customer_type: { $first: '$customer_type' },
              salutation: { $first: '$salutation' },
              gender: { $first: '$gender' },
              territory_id: { $first: '$territory_id' },
              lead_id: { $first: '$lead_id' },
              opportunity_id: { $first: '$opportunity_id' },
              prospect_id: { $first: '$prospect_id' },
              account_manager_id: { $first: '$account_manager_id' },
              billing_currency_id: { $first: '$billing_currency_id' },
              price_list_id: { $first: '$price_list_id' },
              bank_account_id: { $first: '$bank_account_id' },
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
              customer_name: 1,
              customer_type: 1,
              salutation: 1,
              gender: 1,
              territory_id: 1,
              lead_id: 1,
              opportunity_id: 1,
              prospect_id: 1,
              account_manager_id: 1,
              billing_currency_id: 1,
              price_list_id: 1,
              bank_account_id: 1,
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
        $or: [{ customer_name: { $regex: searchTerm, $options: 'i' } }]
      }
    ]

    try {
      await connectMongoDB()

      await Customer.aggregate([
        { $match: _search },
        {
          $group: {
            _id: '$_id',
            customer_name: { $first: '$customer_name' },
            customer_type: { $first: '$customer_type' },
            salutation: { $first: '$salutation' },
            gender: { $first: '$gender' },
            territory_id: { $first: '$territory_id' },
            lead_id: { $first: '$lead_id' },
            opportunity_id: { $first: '$opportunity_id' },
            prospect_id: { $first: '$prospect_id' },
            account_manager_id: { $first: '$account_manager_id' },
            billing_currency_id: { $first: '$billing_currency_id' },
            price_list_id: { $first: '$price_list_id' },
            bank_account_id: { $first: '$bank_account_id' }
          }
        },
        {
          $project: {
            _id: 1,
            customer_name: 1,
            customer_type: 1,
            salutation: 1,
            gender: 1,
            territory_id: 1,
            lead_id: 1,
            opportunity_id: 1,
            prospect_id: 1,
            account_manager_id: 1,
            billing_currency_id: 1,
            price_list_id: 1,
            bank_account_id: 1,
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

      await Customer.aggregate([
        { $match: _search },
        {
          $group: {
            _id: '$_id',
            customer_name: { $first: '$customer_name' },
            customer_type: { $first: '$customer_type' },
            salutation: { $first: '$salutation' },
            gender: { $first: '$gender' },
            territory_id: { $first: '$territory_id' },
            lead_id: { $first: '$lead_id' },
            opportunity_id: { $first: '$opportunity_id' },
            prospect_id: { $first: '$prospect_id' },
            account_manager_id: { $first: '$account_manager_id' },
            billing_currency_id: { $first: '$billing_currency_id' },
            price_list_id: { $first: '$price_list_id' },
            bank_account_id: { $first: '$bank_account_id' },
            createdAt: { $first: '$createdAt' },
            c_createdBy: { $first: '$c_createdBy' },
            n_status: { $first: '$n_status' },
            n_published: { $first: '$n_published' }
          }
        },
        {
          $project: {
            _id: 1,
            customer_name: 1,
            customer_type: 1,
            salutation: 1,
            gender: 1,
            territory_id: 1,
            lead_id: 1,
            opportunity_id: 1,
            prospect_id: 1,
            account_manager_id: 1,
            billing_currency_id: 1,
            price_list_id: 1,
            bank_account_id: 1,
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

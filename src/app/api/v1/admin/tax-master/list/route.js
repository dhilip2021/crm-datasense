import { NextResponse } from 'next/server'

// eslint-disable-next-line import/named
import { verifyAccessToken } from '@/helper/clientHelper'
import connectMongoDB from '@/libs/mongodb'
import { TaxMaster } from '@/models/taxMasterModel'

let sendResponse = {
  appStatusCode: '',
  message: '',
  payloadJson: [],
  error: ''
}

export async function GET(request) {
  const id = request.nextUrl.searchParams.get('id')
  const verified = verifyAccessToken()

  await connectMongoDB()

  if (verified.success) {
    const organizationId = verified?.data?.organization_id

    if (id) {
      const taxId = await TaxMaster.findOne({ tax_id: id })

      if (taxId) {
        let _search = {}
        _search['$and'] = [
          {
            $and: [{ n_status: 1 }, { n_published: 1 }, { tax_id: id }, { organization_id: organizationId }]
          }
        ]

        try {
          await connectMongoDB()
          await TaxMaster.aggregate([
            { $match: _search },
            {
              $group: {
                _id: '$_id',
                tax_value: { $first: '$tax_value' },
                tax_id: { $first: '$tax_id' },
                createdAt: { $first: '$createdAt' },
                c_createdBy: { $first: '$c_createdBy' },
                n_status: { $first: '$n_status' },
                n_published: { $first: '$n_published' }
              }
            },
            {
              $project: {
                _id: 1,
                tax_value: 1,
                tax_id: 1,
                createdAt: 1,
                c_createdBy: 1,
                n_status: 1,
                n_published: 1
              }
            },
            {
              $sort: { createdAt: -1 }
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
        sendResponse['appStatusCode'] = 4
        sendResponse['message'] = ''
        sendResponse['payloadJson'] = []
        sendResponse['error'] = 'Invalid Id!'

        return NextResponse.json(sendResponse, { status: 400 })
      }
    } else {
      let _search = {}

      _search['$and'] = [
        {
          $and: [{ n_status: 1 }, { n_published: 1 }, { organization_id: organizationId }]
        }
      ]

      try {
        await connectMongoDB()
        await TaxMaster.aggregate([
          { $match: _search },
          {
            $group: {
              _id: '$_id',
              tax_value: { $first: '$tax_value' },
              tax_id: { $first: '$tax_id' },
              createdAt: { $first: '$createdAt' },
              c_createdBy: { $first: '$c_createdBy' },
              n_status: { $first: '$n_status' },
              n_published: { $first: '$n_published' }
            }
          },

          {
            $lookup: {
              from: 'users',
              localField: 'c_createdBy',
              foreignField: 'user_id',
              as: 'createdById'
            }
          },
          {
            $unwind: {
              path: '$createdById',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $project: {
              _id: 1,
              tax_value: 1,
              tax_id: 1,
              createdAt: 1,
              c_createdBy: 1,
              n_status: 1,
              n_published: 1,
              createdName: '$createdById.user_name'
            }
          },
          {
            $sort: { createdAt: -1 }
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

  const verified = verifyAccessToken()

  console.log(verified,"<<< verifieddddd")


  if (verified.success) {
    const organizationId = verified?.data?.organization_id
    let searchTerm = c_search_term ? c_search_term : ''
    let n_limitTerm = n_limit
    let n_pageTerm = n_page === 1 ? 0 : (n_page - 1) * n_limit

    if (searchTerm !== '') {
      //   let _search = {
      //     n_published: 1,
      //     organization_id: organizationId,
      //     tax_value: { $regex: searchTerm, $options: 'i' }
      //   }
      let _search = {
        n_published: 1,
        organization_id: organizationId,
        $expr: { $regexMatch: { input: { $toString: '$tax_value' }, regex: searchTerm, options: 'i' } }
      }

      try {
        await connectMongoDB()

        const data = await TaxMaster.aggregate([
          { $match: _search },
          {
            $group: {
              _id: '$_id',
              tax_id: { $first: '$tax_id' },
              tax_value: { $first: '$tax_value' },
              createdAt: { $first: '$createdAt' },
              c_createdBy: { $first: '$c_createdBy' },
              n_status: { $first: '$n_status' },
              n_published: { $first: '$n_published' }
            }
          },
          {
            $project: {
              _id: 1,
              tax_id: 1,
              tax_value: 1,
              createdAt: 1,
              c_createdBy: 1,
              n_status: 1,
              n_published: 1
            }
          },
          { $sort: { c_role_priority: 1 } },
          {
            $facet: {
              data: [{ $skip: n_pageTerm }, { $limit: n_limitTerm }],
              total_count: [{ $count: 'count' }]
            }
          }
        ])

        if (data.length > 0) {
          sendResponse.appStatusCode = 0
          sendResponse.message = ''
          sendResponse.payloadJson = data
          sendResponse.error = []
        } else {
          sendResponse.appStatusCode = 0
          sendResponse.message = 'Record not found!'
          sendResponse.payloadJson = []
          sendResponse.error = []
        }

        return NextResponse.json(sendResponse, { status: 200 })
      } catch (err) {
        sendResponse.appStatusCode = 4
        sendResponse.message = ''
        sendResponse.payloadJson = []
        sendResponse.error = err
        return NextResponse.json(sendResponse, { status: 400 })
      }
    } else {
      let _search = {}

      _search['$and'] = [
        {
          $and: [{ n_published: 1, organization_id: organizationId }]
        }
      ]

      try {
        await connectMongoDB()

        await TaxMaster.aggregate([
          { $match: _search },
          {
            $group: {
              _id: '$_id',
              tax_id: { $first: '$tax_id' },
              tax_value: { $first: '$tax_value' },
              createdAt: { $first: '$createdAt' },
              c_createdBy: { $first: '$c_createdBy' },
              n_status: { $first: '$n_status' },
              n_published: { $first: '$n_published' }
            }
          },
          {
            $project: {
              _id: 1,
              tax_id: 1,
              tax_value: 1,
              createdAt: 1,
              c_createdBy: 1,
              n_status: 1,
              n_published: 1
            }
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
  } else {
    sendResponse['appStatusCode'] = 4
    sendResponse['message'] = ''
    sendResponse['payloadJson'] = []
    sendResponse['error'] = 'token expired!'

    return NextResponse.json(sendResponse, { status: 400 })
  }
}

import { NextResponse } from 'next/server'

// eslint-disable-next-line import/named
import { verifyAccessToken } from '@/helper/clientHelper'
import connectMongoDB from '@/libs/mongodb'
import { CategoryMaster } from '@/models/categoryMasterModel'

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
      const categoryId = await CategoryMaster.findOne({ prod_id: id })

      if (categoryId) {
        let _search = {}
        _search['$and'] = [
          {
            $and: [{ n_status: 1 }, { n_published: 1 }, { prod_id: id }, { organization_id: organizationId }]
          }
        ]

        try {
          await connectMongoDB()
          await CategoryMaster.aggregate([
            { $match: _search },
            {
              $group: {
                _id: '$_id',
                category_type: { $first: '$category_type' },
                prod_name: { $first: '$prod_name' },                
                prod_id: { $first: '$prod_id' },
                createdAt: { $first: '$createdAt' },
                c_createdBy: { $first: '$c_createdBy' },
                n_status: { $first: '$n_status' },
                n_published: { $first: '$n_published' }
              }
            },
            {
              $project: {
                _id: 1,
                category_type: 1,
                prod_name: 1,
                prod_id: 1,
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
        await CategoryMaster.aggregate([
          { $match: _search },
          {
            $group: {
              _id: '$_id',
               category_type: { $first: '$category_type' },
              prod_name: { $first: '$prod_name' },
              prod_id: { $first: '$prod_id' },
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
              category_type: 1,
              prod_name: 1,
              prod_id: 1,
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

  if (verified.success) {
    const organizationId = verified?.data?.organization_id
    let searchTerm = c_search_term ? c_search_term : ''
    let n_limitTerm = n_limit
    let n_pageTerm = n_page === 1 ? 0 : (n_page - 1) * n_limit

    if (searchTerm !== '') {
      //   let _search = {
      //     n_published: 1,
      //     organization_id: organizationId,
      //     prod_name: { $regex: searchTerm, $options: 'i' }
      //   }
      let _search = {
        n_published: 1,
        organization_id: organizationId,
        $expr: { $regexMatch: { input: { $toString: '$prod_name' }, regex: searchTerm, options: 'i' } }
      }

      try {
        await connectMongoDB()

        const data = await CategoryMaster.aggregate([
          { $match: _search },
          {
            $group: {
              _id: '$_id',
              category_type: { $first: '$category_type' },
              prod_id: { $first: '$prod_id' },
              prod_name: { $first: '$prod_name' },
              createdAt: { $first: '$createdAt' },
              c_createdBy: { $first: '$c_createdBy' },
              n_status: { $first: '$n_status' },
              n_published: { $first: '$n_published' }
            }
          },
          {
            $project: {
              _id: 1,
              category_type: 1,
              prod_id: 1,
              prod_name: 1,
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

        await CategoryMaster.aggregate([
          { $match: _search },
          {
            $group: {
              _id: '$_id',
              category_type: { $first: '$category_type' },
              prod_id: { $first: '$prod_id' },
              prod_name: { $first: '$prod_name' },
              createdAt: { $first: '$createdAt' },
              c_createdBy: { $first: '$c_createdBy' },
              n_status: { $first: '$n_status' },
              n_published: { $first: '$n_published' }
            }
          },
          {
            $project: {
              _id: 1,
              category_type: 1,
              prod_id: 1,
              prod_name: 1,
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

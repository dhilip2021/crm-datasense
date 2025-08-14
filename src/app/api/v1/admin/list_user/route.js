import { NextResponse } from 'next/server'

import { UserRole } from '@/models/userRoleModel'
import { User } from '@/models/userModel'

import { verifyAccessToken } from '@/helper/clientHelper'
import connectMongoDB from '@/libs/mongodb'
import { decrypCryptoRequest, maskEmail } from '@/helper/frontendHelper'

let sendResponse = {
  appStatusCode: '',
  message: '',
  payloadJson: [],
  error: ''
}

export async function POST(request) {
  const { organization_id, n_page, n_limit, c_search_term } = await request.json()

  const verified = verifyAccessToken()

  await connectMongoDB()

  const userRoleData = await UserRole.findOne({ c_role_id: verified.data.c_role_id })

  const RoleData = await UserRole.find({
    c_role_priority: { $gt: userRoleData.c_role_priority }
  })

  const checkArray = []

  RoleData.map(data => {
    checkArray.push(data.c_role_id)
  })

  try {
    if (verified.success) {
      let _search = {}
      let n_limitTerm = n_limit
      let n_pageTerm = n_page === 1 ? 0 : (n_page - 1) * n_limit
      let searchTerm = c_search_term ? c_search_term : ''

      const hasRoles = checkArray.length > 0

      if (searchTerm !== '') {
        _search = {
          organization_id,
          $or: [{ user_name: { $regex: searchTerm, $options: 'i' } }, { email: { $regex: searchTerm, $options: 'i' } }],
          n_published: 1,
          ...(hasRoles && { c_role_id: { $in: checkArray } })
        }
      } else {
        _search = {
          organization_id,
          n_published: 1,
          ...(hasRoles && { c_role_id: { $in: checkArray } })
        }
      }

      if (n_limitTerm !== '' && n_pageTerm !== '') {
        await User.aggregate([
          {
            $match: _search
          },
          {
            $group: {
              _id: '$_id',
              first_name: { $first: '$first_name' },
              last_name: { $first: '$last_name' },
              user_name: { $first: '$user_name' },
              user_id: { $first: '$user_id' },
              email: { $first: '$email' },
              c_about_user: { $first: '$c_about_user' },
              password: { $first: '$password' },
              role: { $first: '$role' },
              c_user_img_url: { $first: '$c_user_img_url' },
              c_role_id: { $first: '$c_role_id' },
              n_status: { $first: '$n_status' },
              n_published: { $first: '$n_published' },
              createdAt: { $first: '$createdAt' },
              c_createdBy: { $first: '$c_createdBy' }
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
            $lookup: {
              from: 'userroles',
              localField: 'c_role_id',
              foreignField: 'c_role_id',
              as: 'userroleList'
            }
          },
          {
            $unwind: {
              path: '$userroleList',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $project: {
              _id: 1,
              first_name: 1,
              user_id: 1,
              last_name: 1,
              user_name: 1,
              email: 1,
              c_about_user: 1,
              password: 1,
              role: 1,
              c_user_img_url: 1,
              c_role_id: 1,
              n_status: 1,
              n_published: 1,
              createdAt: 1,
              c_createdBy: 1,
              createdName: '$createdById.user_name',
              c_role_name: '$userroleList.c_role_name'
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

            console.log(data,"<< DATA")
            if (data[0].data.length > 0) {

                 // Modify each record before sending
        const updatedData = data.map(payload => {
            return {
                ...payload,
                data: payload.data.map(user => {
                   
                    // Decrypt email if exists
                    if (user.email) {
                        try {
                            user.email = maskEmail(decrypCryptoRequest(user.email));
                        } catch (err) {
                            console.error("Email decryption failed:", err);
                        }
                    }
                    return user;
                })
            };
        });

              sendResponse['appStatusCode'] = 0
              sendResponse['message'] = ''
              sendResponse['payloadJson'] = updatedData
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
      } else {
        sendResponse['appStatusCode'] = 3
        sendResponse['message'] = ''
        sendResponse['payloadJson'] = []
        sendResponse['error'] = 'Invalid Payload'

        return NextResponse.json(sendResponse, { status: 200 })
      }
    } else {
      sendResponse['appStatusCode'] = 4
      sendResponse['message'] = []
      sendResponse['payloadJson'] = []
      sendResponse['error'] = verified.error

      return NextResponse.json(sendResponse, { status: 200 })
    }
  } catch (error) {
    sendResponse['appStatusCode'] = 4
    sendResponse['message'] = []
    sendResponse['payloadJson'] = []
    sendResponse['error'] = 'Something went wrong!'

    return NextResponse.json(sendResponse, { status: 400 })
  }
}

export async function GET(request) {
  const id = request.nextUrl.searchParams.get('id')
  const verified = verifyAccessToken()

  try {
    await connectMongoDB()

    if (verified.success) {
      let _search = {}

      if (id) {
        _search['$and'] = [
          {
            $and: [{ n_published: 1 }, { user_id: id }]
          }
        ]

        await User.aggregate([
          {
            $match: _search
          },
          {
            $group: {
              _id: '$_id',
              first_name: { $first: '$first_name' },
              last_name: { $first: '$last_name' },
              user_name: { $first: '$user_name' },
              user_id: { $first: '$user_id' },
              email: { $first: '$email' },
              c_about_user: { $first: '$c_about_user' },
              password: { $first: '$password' },
              role: { $first: '$role' },
              c_user_img_url: { $first: '$c_user_img_url' },
              c_role_id: { $first: '$c_role_id' },
              n_status: { $first: '$n_status' },
              n_published: { $first: '$n_published' },
              createdAt: { $first: '$createdAt' },
              c_createdBy: { $first: '$c_createdBy' }
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
            $lookup: {
              from: 'userroles',
              localField: 'c_role_id',
              foreignField: 'c_role_id',
              as: 'userroleLists'
            }
          },
          {
            $unwind: {
              path: '$userroleLists',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $project: {
              _id: 1,
              first_name: 1,
              user_id: 1,
              last_name: 1,
              user_name: 1,
              email: 1,
              c_about_user: 1,
              password: 1,
              role: 1,
              c_user_img_url: 1,
              c_role_id: 1,
              n_status: 1,
              n_published: 1,
              createdAt: 1,
              c_createdBy: 1,
              createdName: '$createdById.user_name',
              c_role_name: '$userroleLists.c_role_name'
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
      } else {
        _search['$and'] = [
          {
            $and: [{ n_published: 1 }]
          }
        ]

        await User.aggregate([
          {
            $match: _search
          },
          {
            $group: {
              _id: '$_id',
              first_name: { $first: '$first_name' },
              last_name: { $first: '$last_name' },
              user_name: { $first: '$user_name' },
              user_id: { $first: '$user_id' },
              email: { $first: '$email' },
              c_about_user: { $first: '$c_about_user' },
              password: { $first: '$password' },
              role: { $first: '$role' },
              c_user_img_url: { $first: '$c_user_img_url' },
              c_role_id: { $first: '$c_role_id' },
              n_status: { $first: '$n_status' },
              n_published: { $first: '$n_published' },
              createdAt: { $first: '$createdAt' },
              c_createdBy: { $first: '$c_createdBy' }
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
            $lookup: {
              from: 'userroles',
              localField: 'c_role_id',
              foreignField: 'c_role_id',
              as: 'userroleList'
            }
          },
          {
            $unwind: {
              path: '$userroleList',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $project: {
              _id: 1,
              first_name: 1,
              user_id: 1,
              last_name: 1,
              user_name: 1,
              email: 1,
              c_about_user: 1,
              password: 1,
              role: 1,
              c_user_img_url: 1,
              c_role_id: 1,
              n_status: 1,
              n_published: 1,
              createdAt: 1,
              c_createdBy: 1,
              createdName: '$createdById.user_name',
              c_role_name: '$userroleList.c_role_name'
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
      }
    } else {
      sendResponse['appStatusCode'] = 4
      sendResponse['message'] = []
      sendResponse['payloadJson'] = []
      sendResponse['error'] = verified.error

      return NextResponse.json(sendResponse, { status: 200 })
    }
  } catch (error) {
    sendResponse['appStatusCode'] = 4
    sendResponse['message'] = []
    sendResponse['payloadJson'] = []
    sendResponse['error'] = 'Something went wrong!'

    return NextResponse.json(sendResponse, { status: 400 })
  }
}

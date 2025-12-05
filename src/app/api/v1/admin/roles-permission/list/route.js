import { NextResponse } from 'next/server'

// eslint-disable-next-line import/named
import { verifyAccessToken } from '@/helper/clientHelper'
import connectMongoDB from '@/libs/mongodb'
import { UserRole } from '@/models/userRoleModel'
import { RolesandPermission } from '@/models/rolesAndPermissionModel'

let sendResponse = {
  appStatusCode: '',
  message: '',
  payloadJson: [],
  error: ''
}

export async function GET(request) {
  const verified = verifyAccessToken();

  const userId = request.nextUrl.searchParams.get("user_id");

  if (!verified.success) {
    sendResponse = {
      appStatusCode: 4,
      message: '',
      payloadJson: [],
      error: 'token expired!'
    };
    return NextResponse.json(sendResponse, { status: 400 });
  }

  await connectMongoDB();

  // 🔥 Fetch logged-in user permission
  const permissionData = await RolesandPermission.findOne({
    organization_id: verified.data.organization_id,
    c_user_id: userId,
    n_published: 1
  });

  if (!permissionData) {
    sendResponse = {
      appStatusCode: 0,
      message: "No permissions found",
      payloadJson: [],
      error: []
    };
    return NextResponse.json(sendResponse, { status: 200 });
  }

  sendResponse = {
    appStatusCode: 0,
    message: '',
    payloadJson: permissionData.menu_privileges_status,
    error: []
  };

  return NextResponse.json(sendResponse, { status: 200 });
}



export async function POST(request) {
  const { n_limit, n_page, c_search_term } = await request.json()

  let searchTerm = c_search_term ? c_search_term : ''
  let n_limitTerm = n_limit
  let n_pageTerm = n_page === 1 ? 0 : (n_page - 1) * n_limit

   const verified = verifyAccessToken();

    console.log(verified?.data?.organization_id,"<<< VERIFIED organization_id")

    const organization_id = verified?.data?.organization_id


      if (!verified.success) {
    sendResponse = {
      appStatusCode: 4,
      message: '',
      payloadJson: [],
      error: 'token expired!'
    };
    return NextResponse.json(sendResponse, { status: 400 });
  }
 

  if (searchTerm !== '') {
    let _search = {}

    _search['$and'] = [
      {
        $and: [ { n_published: 1 }]
      }
    ]

    try {
      await connectMongoDB()

      await UserRole.aggregate([
        { $match: _search },
        {
          $group: {
            _id: '$_id',
            c_user_id: { $first: '$c_user_id' },
            menu_privileges_status: { $first: '$menu_privileges_status' },
          }
        },
        {
          $project: {
            _id: 1,
            c_user_id: 1,
            menu_privileges_status: 1,
            createdAt: 1,
            c_createdBy: 1,
            n_status: 1,
            n_published: 1
          }
        },
        {
          $sort: { c_role_priority: 1 }
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
        $and: [ { n_published: 1, organization_id: organization_id }]
      }
    ]

    try {
      await connectMongoDB()

      await RolesandPermission.aggregate([
        { $match: _search },
        {
          $group: {
            _id: '$_id',
            c_user_id: { $first: '$c_user_id' },
            menu_privileges_status: { $first: '$menu_privileges_status' },
            createdAt: { $first: '$createdAt' },
            c_createdBy: { $first: '$c_createdBy' },
            n_status: { $first: '$n_status' },
            n_published: { $first: '$n_published' }
          }
        },
        {
          $project: {
            _id: 1,
            c_user_id: 1,
            menu_privileges_status: 1,
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
        $lookup: {
          from: 'users',
          localField: 'c_user_id',
          foreignField: 'user_id',
          as: 'userList'
        },
         
      },
      {
          $addFields: {
            c_user_name: { $arrayElemAt: ['$userList.user_name', 0] },
           
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
}


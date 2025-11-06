import { NextResponse } from 'next/server'
import { UserRole } from '@/models/userRoleModel'
import { User } from '@/models/userModel'
import { verifyAccessToken } from '@/helper/clientHelper'
import connectMongoDB from '@/libs/mongodb'
import { decrypCryptoRequest } from '@/helper/frontendHelper'

let sendResponse = {
  appStatusCode: '',
  message: '',
  payloadJson: [],
  error: ''
}

export async function GET(request) {
  const id = request.nextUrl.searchParams.get('id')
  const orgid = request.nextUrl.searchParams.get('orgid')
  const verified = verifyAccessToken()

  try {
    await connectMongoDB()

    if (!verified.success) {
      sendResponse = {
        appStatusCode: 4,
        message: [],
        payloadJson: [],
        error: verified.error
      }
      return NextResponse.json(sendResponse, { status: 200 })
    }

    // Current User Role
    const currentRole = await UserRole.findOne({ c_role_id: verified.data.c_role_id })

    // Default search
    let _search = { n_published: 1 }

    if (id) _search.user_id = id
    if (orgid) _search.organization_id = orgid
    else if (verified.data.organization_id) _search.organization_id = verified.data.organization_id

    // Role hierarchy filter (include current role + lower roles)
    let allowedRoleIds = []
    if (currentRole?.c_role_priority) {
      const allowedRoles = await UserRole.find({
        c_role_priority: { $gte: currentRole.c_role_priority },
        n_published: 1
      })
      allowedRoleIds = allowedRoles.map(r => r.c_role_id)
    }

    if (allowedRoleIds.length) {
      _search.c_role_id = { $in: allowedRoleIds }
    }

    const data = await User.aggregate([
      { $match: _search },
      {
        $lookup: {
          from: 'userroles',
          localField: 'c_role_id',
          foreignField: 'c_role_id',
          as: 'userroleList'
        }
      },
      { $unwind: { path: '$userroleList', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'c_createdBy',
          foreignField: 'user_id',
          as: 'createdByUser'
        }
      },
      { $unwind: { path: '$createdByUser', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          first_name: 1,
          last_name: 1,
          user_name: 1,
          user_id: 1,
          email: 1,
          mobile: 1,
          c_about_user: 1,
          role: 1,
          c_user_img_url: 1,
          c_role_id: 1,
          n_status: 1,
          n_published: 1,
          createdAt: 1,
          c_createdBy: 1,
          createdName: '$createdByUser.user_name',
          c_role_name: '$userroleList.c_role_name'
        }
      },
      { $sort: { createdAt: -1 } }
    ])

    const updatedData = data.map(user => {
      try {
        if (user.email) user.email = decrypCryptoRequest(user.email)
        if (user.mobile) user.mobile = decrypCryptoRequest(user.mobile)
      } catch (err) {
        console.error('Decryption failed:', err)
      }
      return user
    })

    sendResponse = {
      appStatusCode: 0,
      message: updatedData.length ? '' : 'Record not found!',
      payloadJson: updatedData,
      error: []
    }

    return NextResponse.json(sendResponse, { status: 200 })
  } catch (error) {
    console.error('GET ERROR:', error)
    sendResponse = {
      appStatusCode: 4,
      message: [],
      payloadJson: [],
      error: 'Something went wrong!'
    }
    return NextResponse.json(sendResponse, { status: 400 })
  }
}

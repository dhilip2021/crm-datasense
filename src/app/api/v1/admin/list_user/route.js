import { NextResponse } from 'next/server'
import { UserRole } from '@/models/userRoleModel'
import { User } from '@/models/userModel'
import { verifyAccessToken } from '@/helper/clientHelper'
import connectMongoDB from '@/libs/mongodb'
import { decrypCryptoRequest, encryptCryptoResponse, maskEmail } from '@/helper/frontendHelper'

// Standard Response Structure
let sendResponse = {
  appStatusCode: '',
  message: '',
  payloadJson: [],
  error: ''
}

/**
 * POST API - Paginated Users List
 * Filters based on current user's role priority
 */
export async function POST(request) {
  const { organization_id, n_page, n_limit, c_search_term } = await request.json()

  const verified = verifyAccessToken()
  await connectMongoDB()

  try {
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
    const currentRole = await UserRole.findOne({
      c_role_id: verified.data.c_role_id
    })

    // Default search
    let _search = { n_published: 1 }

    // organization_id apply only if not empty
    if (organization_id && organization_id.trim() !== '') {
      _search.organization_id = organization_id
    }

    // If not Super Admin → apply role restriction
    if (currentRole?.c_role_priority !== 1) {
      const allowedRoles = await UserRole.find({
        c_role_priority: { $gt: currentRole.c_role_priority }
      })
      const checkArray = allowedRoles.map(r => r.c_role_id)
      if (checkArray.length > 0) {
        _search.c_role_id = { $in: checkArray }
      }
    }

    // Search term
    if (c_search_term && c_search_term.trim() !== '') {
      _search.$or = [
        { user_name: { $regex: c_search_term, $options: 'i' } },
        { email: { $regex: c_search_term, $options: 'i' } }
      ]
    }

    // Pagination
    const n_limitTerm = parseInt(n_limit)
    const n_pageTerm = n_page === 1 ? 0 : (n_page - 1) * n_limitTerm

    if (!n_limitTerm && n_limitTerm !== 0) {
      sendResponse = {
        appStatusCode: 3,
        message: '',
        payloadJson: [],
        error: 'Invalid Payload'
      }
      return NextResponse.json(sendResponse, { status: 200 })
    }

    // User Aggregation Pipeline
    const data = await User.aggregate([
      { $match: _search },
      {
        $group: {
          _id: '$_id',
          first_name: { $first: '$first_name' },
          last_name: { $first: '$last_name' },
          user_name: { $first: '$user_name' },
          user_id: { $first: '$user_id' },
          email: { $first: '$email' },
          mobile: { $first: '$mobile' },
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
      { $unwind: { path: '$createdById', preserveNullAndEmptyArrays: true } },
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
        $project: {
          _id: 1,
          first_name: 1,
          last_name: 1,
          user_name: 1,
          user_id: 1,
          email: 1,
          mobile: 1,
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
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          data: [{ $skip: n_pageTerm }, { $limit: n_limitTerm }],
          total_count: [{ $count: 'count' }]
        }
      }
    ])

    if (data[0]?.data?.length > 0) {
      // Mask + Decrypt fields
      const updatedData = data.map(payload => ({
        ...payload,
        data: payload.data.map(user => {
          try {
            if (user.email) {
              user.email = maskEmail(decrypCryptoRequest(user.email))
            }
            if (user.mobile) {
              user.mobile = maskEmail(decrypCryptoRequest(user.mobile))
            }
          } catch (err) {
            console.error('Decryption failed:', err)
          }
          return user
        })
      }))

      sendResponse = {
        appStatusCode: 0,
        message: '',
        payloadJson: encryptCryptoResponse(updatedData),
        error: []
      }
    } else {
      sendResponse = {
        appStatusCode: 0,
        message: 'Record not found!',
        payloadJson: [],
        error: []
      }
    }

    return NextResponse.json(sendResponse, { status: 200 })
  } catch (error) {
    console.error('POST ERROR:', error)
    sendResponse = {
      appStatusCode: 4,
      message: [],
      payloadJson: [],
      error: 'Something went wrong!'
    }
    return NextResponse.json(sendResponse, { status: 400 })
  }
}

/**
 * GET API - Get user detail (by id or all)
 */
// export async function GET(request) {
//   const id = request.nextUrl.searchParams.get('id')
//   const orgid = request.nextUrl.searchParams.get('orgid')
//   const verified = verifyAccessToken()

//   console.log(verified, "<<< VERIFIEDDD")

//   try {
//     await connectMongoDB()

//     if (!verified.success) {
//       sendResponse = {
//         appStatusCode: 4,
//         message: [],
//         payloadJson: [],
//         error: verified.error
//       }
//       return NextResponse.json(sendResponse, { status: 200 })
//     }

//     let _search = { n_published: 1 }
//     if (id) _search.user_id = id
//     if (orgid) _search.organization_id = orgid

//     const data = await User.aggregate([
//       { $match: _search },
//       {
//         $group: {
//           _id: '$_id',
//           first_name: { $first: '$first_name' },
//           last_name: { $first: '$last_name' },
//           user_name: { $first: '$user_name' },
//           user_id: { $first: '$user_id' },
//           email: { $first: '$email' },
//           c_about_user: { $first: '$c_about_user' },
//           password: { $first: '$password' },
//           role: { $first: '$role' },
//           c_user_img_url: { $first: '$c_user_img_url' },
//           c_role_id: { $first: '$c_role_id' },
//           n_status: { $first: '$n_status' },
//           n_published: { $first: '$n_published' },
//           createdAt: { $first: '$createdAt' },
//           c_createdBy: { $first: '$c_createdBy' }
//         }
//       },
//       {
//         $lookup: {
//           from: 'users',
//           localField: 'c_createdBy',
//           foreignField: 'user_id',
//           as: 'createdById'
//         }
//       },
//       { $unwind: { path: '$createdById', preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: 'userroles',
//           localField: 'c_role_id',
//           foreignField: 'c_role_id',
//           as: 'userroleList'
//         }
//       },
//       { $unwind: { path: '$userroleList', preserveNullAndEmptyArrays: true } },
//       {
//         $project: {
//           _id: 1,
//           first_name: 1,
//           last_name: 1,
//           user_name: 1,
//           user_id: 1,
//           email: 1,
//           c_about_user: 1,
//           password: 1,
//           role: 1,
//           c_user_img_url: 1,
//           c_role_id: 1,
//           n_status: 1,
//           n_published: 1,
//           createdAt: 1,
//           c_createdBy: 1,
//           createdName: '$createdById.user_name',
//           c_role_name: '$userroleList.c_role_name'
//         }
//       },
//       { $sort: { createdAt: -1 } }
//     ])

//     if (data.length > 0) {
//       sendResponse = {
//         appStatusCode: 0,
//         message: '',
//         payloadJson: data,
//         error: []
//       }
//     } else {
//       sendResponse = {
//         appStatusCode: 0,
//         message: 'Record not found!',
//         payloadJson: [],
//         error: []
//       }
//     }

//     return NextResponse.json(sendResponse, { status: 200 })
//   } catch (error) {
//     sendResponse = {
//       appStatusCode: 4,
//       message: [],
//       payloadJson: [],
//       error: 'Something went wrong!'
//     }
//     return NextResponse.json(sendResponse, { status: 400 })
//   }
// }



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
    const currentRole = await UserRole.findOne({
      c_role_id: verified.data.c_role_id
    })

    // Default search
    let _search = { n_published: 1 }

    if (id) _search.user_id = id
    if (orgid) _search.organization_id = orgid
    else if (verified.data.organization_id) {
      _search.organization_id = verified.data.organization_id
    }

    // If not Super Admin → apply role restriction
    if (currentRole?.c_role_priority !== 1) {
      const allowedRoles = await UserRole.find({
        c_role_priority: { $gt: currentRole.c_role_priority }
      })
      const checkArray = allowedRoles.map(r => r.c_role_id)
      if (checkArray.length > 0) {
        _search.c_role_id = { $in: checkArray }
      }
    }

    const data = await User.aggregate([
      { $match: _search },
      {
        $group: {
          _id: '$_id',
          first_name: { $first: '$first_name' },
          last_name: { $first: '$last_name' },
          user_name: { $first: '$user_name' },
          user_id: { $first: '$user_id' },
          email: { $first: '$email' },
          mobile: { $first: '$mobile' },
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
      { $unwind: { path: '$createdById', preserveNullAndEmptyArrays: true } },
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
        $project: {
          _id: 1,
          first_name: 1,
          last_name: 1,
          user_name: 1,
          user_id: 1,
          email: 1,
          mobile: 1,
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
      { $sort: { createdAt: -1 } }
    ])

    if (data.length > 0) {
      // Decrypt + Mask like in POST
      const updatedData = data.map(user => {
        try {
          if (user.email) {
            // user.email = maskEmail(decrypCryptoRequest(user.email))
            user.email = decrypCryptoRequest(user.email)
          }
          if (user.mobile) {
            // user.mobile = maskEmail(decrypCryptoRequest(user.mobile))
            user.mobile = decrypCryptoRequest(user.mobile)
          }
        } catch (err) {
          console.error('Decryption failed:', err)
        }
        return user
      })

      sendResponse = {
        appStatusCode: 0,
        message: '',
        // payloadJson: encryptCryptoResponse(updatedData),
        payloadJson: updatedData,
        error: []
      }
    } else {
      sendResponse = {
        appStatusCode: 0,
        message: 'Record not found!',
        payloadJson: [],
        error: []
      }
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


import { NextResponse } from 'next/server'

import connectMongoDB from '@/libs/mongodb'
import { verifyAccessToken } from '@/helper/clientHelper'
import Leadform from '@/models/Leadform'

let sendResponse = {
  appStatusCode: '',
  message: '',
  payloadJson: [],
  error: ''
}

export async function GET(request) {
  const verified = verifyAccessToken()
  const searchParams = request.nextUrl.searchParams

  const orgId = searchParams.get('orgId')
  const formName = searchParams.get('formName')
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const sendResponse = {
    appStatusCode: 0,
    message: '',
    payloadJson: [],
    error: []
  }

  if (!verified.success) {
    sendResponse.appStatusCode = 4
    sendResponse.error = 'token expired!'
    return NextResponse.json(sendResponse, { status: 400 })
  }

  if (orgId && formName && from && to) {
    try {
      await connectMongoDB()

      // 🧠 build dynamic search filter
      const matchConditions = [
        { organization_id: orgId },
        { form_name: formName }
      ]

      if (from || to) {
        const dateFilter = {}
        if (from) dateFilter.$gte = new Date(from)
        if (to) dateFilter.$lte = new Date(to + 'T23:59:59')
        matchConditions.push({ submittedAt: dateFilter })
      }

      const data = await Leadform.aggregate([
        { $match: { $and: matchConditions } },
        {
          $project: {
            _id: 1,
            organization_id: 1,
            lead_id: 1,
            lead_slug_name: 1,
            lead_name: 1,
            form_name: 1,
            First_Name: '$values.First Name',
            Last_Name: '$values.Last Name',
            Email: '$values.Email',
            Phone: '$values.Phone',
            Company: '$values.Company',
            Designation: '$values.Designation',
            Job_Title: '$values.Job Title',
            Website: '$values.Website',
            Lead_Source: '$values.Lead Source',
            Lead_Status: '$values.Lead Status',
            Employees_Size: '$values.Employees Size',
            City: '$values.City',
            Next_Follow_up_Date: '$values.Next Follow-up Date',
            Timeline_to_Buy: '$values.Timeline to Buy',
            Score: '$values.Score',
            Label: '$values.Label',
            Notes: '$values.Notes',
            Activity: '$values.Activity',
            c_createdBy: 1,
            createdAt: 1,
            updatedAt: 1
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'c_createdBy',
            foreignField: 'user_id',
            as: 'user'
          }
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            createdByName: '$user.user_name'
          }
        },
        { $sort: { createdAt: -1 } }
      ])

      if (data.length > 0) {
        sendResponse.payloadJson = data
      } else {
        sendResponse.message = 'Record not found!'
      }

      return NextResponse.json(sendResponse, { status: 200 })
    } catch (err) {
      console.error('Error:', err)
      sendResponse.appStatusCode = 4
      sendResponse.error = 'Something went wrong!'
      return NextResponse.json(sendResponse, { status: 400 })
    }
  } else {
    sendResponse.appStatusCode = 4
    sendResponse.message = 'Missing required query parameters!'
    return NextResponse.json(sendResponse, { status: 400 })
  }
}

export async function POST(request) {
  const { n_limit, n_page, c_search_term, organization_id } = await request.json()

  await connectMongoDB()

  const verified = verifyAccessToken()

  let searchTerm = c_search_term ? c_search_term : ''
  let n_limitTerm = n_limit
  let n_pageTerm = n_page === 1 ? 0 : (n_page - 1) * n_limit

  if (verified.success) {
    if (searchTerm !== '') {
      let _search = {}

      if (verified.data.c_role_id === '16f01165898b') {
        _search['$and'] = [
          {
            $and: [{ n_status: 1 }, { n_published: 1 }, { organization_id: organization_id }, { live_status: 'lead' }],
            $or: [
              { lead_name: { $regex: searchTerm, $options: 'i' } },
              { first_name: { $regex: searchTerm, $options: 'i' } },
              { last_name: { $regex: searchTerm, $options: 'i' } },
              { email: { $regex: searchTerm, $options: 'i' } },
              { mobile: { $regex: searchTerm, $options: 'i' } },
              { phone: { $regex: searchTerm, $options: 'i' } },
              { organization: { $regex: searchTerm, $options: 'i' } }
            ]
          }
        ]
      } else {
        _search['$and'] = [
          {
            $and: [
              { n_status: 1 },
              { n_published: 1 },
              { organization_id: organization_id },
              { live_status: 'lead' },
              { c_createdBy: verified.data.user_id }
            ],
            $or: [
              { lead_name: { $regex: searchTerm, $options: 'i' } },
              { first_name: { $regex: searchTerm, $options: 'i' } },
              { last_name: { $regex: searchTerm, $options: 'i' } },
              { email: { $regex: searchTerm, $options: 'i' } },
              { mobile: { $regex: searchTerm, $options: 'i' } },
              { phone: { $regex: searchTerm, $options: 'i' } },
              { organization: { $regex: searchTerm, $options: 'i' } }
            ]
          }
        ]
      }

      try {
        await Leadform.aggregate([
          { $match: _search },
          {
            $project: {
              _id: 1,
              organization_id: 1,
              lead_id: 1,
              lead_slug_name: 1,
              form_name: 1,
              First_Name: '$values.First Name',
              Last_Name: '$values.Last Name',
              Company: '$values.Company',
              Lead_Source: '$values.Lead Source',
              Lead_Status: '$values.Lead Status',
              Next_Follow_up_Date: '$values.Next Follow-up Date',
              Notes: '$values.Notes',
              c_createdBy: 1,
              createdAt: 1,
              updatedAt: 1
            }
          },
          { $sort: { createdAt: -1 } }
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

      if (verified.data.c_role_id === '16f01165898b') {
        _search['$and'] = [
          {
            $and: [{ n_status: 1 }, { n_published: 1 }, { organization_id: organization_id }, { live_status: 'lead' }]
          }
        ]
      } else {
        _search['$and'] = [
          {
            $and: [
              { n_status: 1 },
              { n_published: 1 },
              { organization_id: organization_id },
              { live_status: 'lead' },
              { c_createdBy: verified.data.user_id }
            ]
          }
        ]
      }

      try {
        await connectMongoDB()

        await Leadform.aggregate([
          { $match: _search },
          {
            $project: {
              _id: 1,
              organization_id: 1,
              lead_id: 1,
              lead_slug_name: 1,
              form_name: 1,
              First_Name: '$values.First Name',
              Last_Name: '$values.Last Name',
              Company: '$values.Company',
              Lead_Source: '$values.Lead Source',
              Lead_Status: '$values.Lead Status',
              Next_Follow_up_Date: '$values.Next Follow-up Date',
              Notes: '$values.Notes',
              c_createdBy: 1,
              createdAt: 1,
              updatedAt: 1
            }
          },
          { $sort: { createdAt: -1 } }
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

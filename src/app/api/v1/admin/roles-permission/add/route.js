import { NextResponse } from 'next/server'
import connectMongoDB from '@/libs/mongodb'
import { create_UUID, verifyAccessToken } from '@/helper/clientHelper'
import { RolesandPermission } from '@/models/rolesAndPermissionModel'

let sendResponse = {
  appStatusCode: '',
  message: '',
  payloadJson: [],
  error: ''
}

export async function POST(request) {
  const { c_user_id, Id, menu_privileges_status, n_status } = await request.json()

  try {
    await connectMongoDB()

    const verified = verifyAccessToken()

    const organization_id = verified?.data?.organization_id

    if (verified.success) {
      if (Id) {
        const rolesPermissionId = await RolesandPermission.findOne({ _id: Id })

        if (rolesPermissionId === null) {
          sendResponse['appStatusCode'] = 4
          sendResponse['message'] = []
          sendResponse['payloadJson'] = []
          sendResponse['error'] = 'Please enter valid id!'

          return NextResponse.json(sendResponse, { status: 200 })
        } else {
          const body = {
            organization_id: organization_id,
            c_user_id,
            menu_privileges_status: menu_privileges_status,
            c_updatedBy: verified.data.user_id
          }

          console.log(body,"<<<< update body")

          await RolesandPermission.findByIdAndUpdate(Id, body)
            .then(result => {
              sendResponse['appStatusCode'] = 0
              sendResponse['message'] = 'Updated Successfully!'
              sendResponse['payloadJson'] = []
              sendResponse['error'] = []
            })
            .catch(err => {
              sendResponse['appStatusCode'] = 4
              sendResponse['message'] = 'Invalid Id'
              sendResponse['payloadJson'] = []
              sendResponse['error'] = err
            })

          return NextResponse.json(sendResponse, { status: 200 })
        }
      } else {
        const checkRolesPermission = await RolesandPermission.findOne({
          organization_id: organization_id,
          c_user_id: c_user_id
        })

        if (c_user_id === '') {
          sendResponse['appStatusCode'] = 4
          sendResponse['message'] = []
          sendResponse['payloadJson'] = []
          sendResponse['error'] = 'Please enter user id!'

          return NextResponse.json(sendResponse, { status: 200 })
        } else if (checkRolesPermission) {
          sendResponse['appStatusCode'] = 4
          sendResponse['message'] = []
          sendResponse['payloadJson'] = []
          sendResponse['error'] = ' This Roles and Permission already exist'

          return NextResponse.json(sendResponse, { status: 200 })
        } else {
          let rolesPermissionSave = new RolesandPermission({
            c_roles_permission_id: create_UUID(),
            organization_id: organization_id,
            c_user_id,
            menu_privileges_status,
            c_createdBy: verified.data.user_id
          })

          await rolesPermissionSave
            .save()
            .then(() => {
              sendResponse['appStatusCode'] = 0
              sendResponse['message'] = 'Role and Permission added Successfully!'
              sendResponse['payloadJson'] = []
              sendResponse['error'] = []
            })
            .catch(err => {
              sendResponse['appStatusCode'] = 4
              sendResponse['message'] = ''
              sendResponse['payloadJson'] = []
              sendResponse['error'] = err
            })

          return NextResponse.json(sendResponse, { status: 200 })
        }
      }
    } else {
      sendResponse = {
        appStatusCode: 4,
        message: [],
        payloadJson: [],
        error: verified.error
      }
      return NextResponse.json(sendResponse, { status: 400 })
    }
  } catch (err) {
    sendResponse['appStatusCode'] = 4
    sendResponse['message'] = ''
    sendResponse['payloadJson'] = []
    sendResponse['error'] = 'Something went wrong!'

    return NextResponse.json(sendResponse, { status: 400 })
  }
}

import { NextResponse } from 'next/server'

import slugify from 'slugify'

import connectMongoDB from '@/libs/mongodb'

import { User } from '@/models/userModel'
import { create_UUID, transporter } from '@/helper/clientHelper'
import { decrypCryptoRequest, encryptCryptoResponse } from '@/helper/frontendHelper'
import { UserRole } from '@/models/userRoleModel'

const bcrypt = require('bcryptjs')

let sendResponse = {
  appStatusCode: '',
  message: '',
  payloadJson: [],
  error: ''
}

function emailSend(mailData) {
  return new Promise(async (resolve, reject) => {
    await transporter.sendMail(mailData, function async(err, data) {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

export async function POST(request) {
  const { data } = await request.json()

  const dData = decrypCryptoRequest(data)

  let passwordCheck = dData?.password ? dData?.password : 'Password@123'

  try {
    await connectMongoDB()

    if (dData?.Id) {
      const userRoleId = await User.findOne({
        _id: dData?.Id
      })

      if (userRoleId === null) {
        sendResponse['appStatusCode'] = 4
        sendResponse['message'] = []
        sendResponse['payloadJson'] = []
        sendResponse['error'] = 'Please enter valid id!'

        return NextResponse.json(sendResponse, { status: 200 })
      } else {
        const hashPass = await bcrypt.hash(passwordCheck, 10)
        const user_name = dData?.first_name + ' ' + dData?.last_name
        const slugString = user_name.replace(/[^\w\s]|_/g, '')

        const slug_name = slugify(slugString, {
          replacement: '-',
          remove: undefined,
          lower: true,
          strict: false,
          locale: 'vi',
          trim: true
        })

        const encEmail = encryptCryptoResponse(dData?.email)
        const encMobile = encryptCryptoResponse(dData?.mobile)
        const body = {
          organization_id: dData?.organization_id,
          first_name: dData?.first_name,
          last_name: dData?.last_name,
          user_name: user_name,
          c_about_user: dData?.c_about_user,
          slug_name: slug_name,
          email: encEmail,
          mobile: encMobile,
          role: dData?.role,
          c_role_id: dData?.c_role_id,
          c_user_img_url: dData?.c_user_img_url,
          n_status: dData?.n_status
        }

        if (dData?.password !== '' && dData?.password !== undefined) {
          body['password'] = hashPass
        }

        await User.findByIdAndUpdate(dData?.Id, body)
          .then(async () => {
            if (dData?.password !== '' && dData?.password !== undefined) {
              let mailData = {
                from: '"No Reply" <dhilipbeece001@gmail.com>', // sender address
                to: `${dData?.email}`, // list of receivers
                subject: 'CRM Datasense password changes',
                text: 'Login Credential',
                html: ``
              }

              mailData['html'] = `
              <b>Hai ${user_name},</b>
              <h4>Your password has been changed by your Admin</h4>
              <br/>
              <h2>your latest password : <b>${dData?.password} </b></h2>
              <h5><b>Thank you, </b> <br /> CRM Datasense</h5>
            `
              const result = await emailSend(mailData)
            }

            sendResponse['appStatusCode'] = 0
            sendResponse['message'] = 'Updated Successfully !!!'
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
      const encEmail = encryptCryptoResponse(dData?.email)

      const checkUserEmail = await User.findOne({
        organization_id: dData?.organization_id,
        email: encEmail
      })

      if (dData?.organization_id === '') {
        sendResponse['appStatusCode'] = 4
        sendResponse['message'] = 'organization id is required'
        sendResponse['payloadJson'] = []
        sendResponse['error'] = ''
      } else if (dData?.first_name === '') {
        sendResponse['appStatusCode'] = 4
        sendResponse['message'] = 'First Name is required'
        sendResponse['payloadJson'] = []
        sendResponse['error'] = ''
      } else if (dData?.email === '') {
        sendResponse['appStatusCode'] = 4
        sendResponse['message'] = 'Email id is required'
        sendResponse['payloadJson'] = []
        sendResponse['error'] = ''
      } else if (dData?.c_role_id === '') {
        sendResponse['appStatusCode'] = 4
        sendResponse['message'] = 'Role is required'
        sendResponse['payloadJson'] = []
        sendResponse['error'] = ''
      } else if (dData?.password === '') {
        sendResponse['appStatusCode'] = 4
        sendResponse['message'] = 'Password is required'
        sendResponse['payloadJson'] = []
        sendResponse['error'] = ''
      } else if (checkUserEmail) {
        sendResponse['appStatusCode'] = 4
        sendResponse['message'] = []
        sendResponse['payloadJson'] = []
        sendResponse['error'] = 'Please check. user email already exist'
      } else {
        const hashPass = await bcrypt.hash(passwordCheck, 10)
        const user_name = dData?.first_name + ' ' + dData?.last_name
        const slugString = user_name.replace(/[^\w\s]|_/g, '')

        const slug_name = slugify(slugString, {
          replacement: '-',
          remove: undefined,
          lower: true,
          strict: false,
          locale: 'vi',
          trim: true
        })

        if (dData?.role !== 'admin' || dData?.role === undefined || dData?.role === '') {
          if (dData?.role === undefined || dData?.role === null || dData?.role === '') {
            let data = {
              organization_id: dData?.organization_id
            }
            const resulData = await User.find(data)

            if (resulData?.length === 0) {
              const encEmail = encryptCryptoResponse(dData?.email)
              const encMobile = encryptCryptoResponse(dData?.mobile)
              const userdata = new User({
                user_id: create_UUID(),
                organization_id: dData?.organization_id,
                first_name: dData?.first_name,
                last_name: dData?.last_name,
                user_name,
                email: encEmail,
                mobile: encMobile,
                role: dData?.role ? dData?.role : 'user',
                slug_name,
                c_about_user: dData?.c_about_user,
                c_role_id: dData?.c_role_id,
                c_user_img_url: dData?.c_user_img_url,
                password: hashPass,
                n_status: dData?.n_status ? dData?.n_status : 1
              })

              await userdata.save().then(async result => {
                let mailData = {
                  from: '"CRM Datasense" <dhilipbeece001@gmail.com>', // sender address
                  to: `${dData?.email}`, // recipient
                  subject: 'Your CRM Datasense Login Credentials',
                  html: `
      <div style="
        font-family: Arial, Helvetica, sans-serif;
        background-color: #f5f7fa;
        padding: 30px;
        color: #333;
      ">
        <div style="
          max-width: 600px;
          margin: auto;
          background: #ffffff;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          overflow: hidden;
        ">
          <div style="background-color: #1976d2; padding: 20px; text-align: center;">
            <h2 style="color: #fff; margin: 0;">CRM Datasense</h2>
            <p style="color: #e0e0e0; margin: 5px 0 0;">Your trusted CRM partner</p>
          </div>

          <div style="padding: 25px;">
            <p style="font-size: 16px;">Hai <b>${user_name}</b>,</p>
            <p style="font-size: 15px; color: #444;">
              Welcome to <b>CRM Datasense</b>! Below are your login credentials:
            </p>

            <div style="
              background-color: #f1f5fb;
              border-radius: 8px;
              padding: 15px 20px;
              margin: 15px 0;
              font-size: 14px;
              line-height: 1.6;
            ">
              <p><b>Login URL:</b> <a href="https://crm-datasense-bj4n.vercel.app/login" style="color: #1976d2;">https://crm-datasense-bj4n.vercel.app/login</a></p>
              <p><b>Email:</b> ${dData?.email}</p>
              <p><b>Password:</b> ${passwordCheck}</p>
            </div>

            <p style="font-size: 14px; color: #555;">
              Please keep your credentials safe. You can change your password after login for security.
            </p>

            <p style="font-size: 14px; margin-top: 25px;">
              <b>Thank you,</b><br />
              The <b>CRM Datasense</b> Team
            </p>
          </div>

          <div style="background-color: #f9fafb; padding: 10px; text-align: center; font-size: 12px; color: #777;">
            © ${new Date().getFullYear()} Datasense Technologies. All rights reserved.
          </div>
        </div>
      </div>
    `
                }

                const emailRes = await emailSend(mailData)
                sendResponse['appStatusCode'] = 0
                sendResponse['message'] = 'User added successfully'
                sendResponse['payloadJson'] = result
                sendResponse['error'] = ''
                return NextResponse.json(sendResponse, { status: 200 })
              })
            } else {
              const currentRole = await UserRole.findOne({ c_role_id: resulData[0]?.c_role_id }) // id from JWT/session
              const newRole = await UserRole.findOne({ c_role_id: dData?.c_role_id })

              console.log(newRole.c_role_priority, '<<<< NEW PRIO')
              console.log(currentRole.c_role_priority, '<<<< CUR PRIO')

              if (!currentRole || !newRole) {
                sendResponse['appStatusCode'] = 4
                sendResponse['message'] = 'Invalid role setup'
                sendResponse['payloadJson'] = []
                sendResponse['error'] = 'Role not found'
                return NextResponse.json(sendResponse, { status: 200 })
              }

              // Priority check: only allow creating lower priority role
              else if (newRole.c_role_priority <= currentRole.c_role_priority) {
                sendResponse['appStatusCode'] = 4
                sendResponse['message'] = 'You cannot create this role'
                sendResponse['payloadJson'] = []
                sendResponse['error'] = 'Not enough permission'
                return NextResponse.json(sendResponse, { status: 200 })
              } else {
                const encEmail = encryptCryptoResponse(dData?.email)
                const encMobile = encryptCryptoResponse(dData?.mobile)
                const userdata = new User({
                  user_id: create_UUID(),
                  organization_id: dData?.organization_id,
                  first_name: dData?.first_name,
                  last_name: dData?.last_name,
                  user_name,
                  email: encEmail,
                  mobile: encMobile,
                  role: 'admin',
                  slug_name,
                  c_about_user: dData?.c_about_user,
                  c_role_id: dData?.c_role_id,
                  c_user_img_url: dData?.c_user_img_url,
                  password: hashPass,
                  n_status: dData?.n_status ? dData?.n_status : 1
                })

                await userdata.save().then(result => {
                  let mailData = {
                    from: '"No Reply" <dhilipbeece001@gmail.com>', // sender address
                    to: `${dData?.email}`, // receiver
                    subject: '🔑 CRM Datasense - Login Credentials',
                    text: 'Your login credentials for CRM Datasense',
                    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; padding: 30px; background: #f9fafc;">
      
      <h2 style="text-align: center; color: #1976d2; margin-bottom: 20px;">CRM Datasense</h2>
      
      <p style="font-size: 15px; color: #333;">Hi <b>${user_name}</b>,</p>
      <p style="font-size: 15px; color: #333; line-height: 1.6;">
        Your account has been created successfully. Please find your login credentials below:
      </p>
      
      <div style="margin: 25px 0; padding: 15px; background: #e3f2fd; border-radius: 8px;">
        <p style="font-size: 16px; color: #333; margin: 5px 0;">
          📧 <b>Email:</b> <span style="color: #1976d2;">${dData?.email}</span>
        </p>
        <p style="font-size: 16px; color: #333; margin: 5px 0;">
          🔑 <b>Password:</b> <span style="color: #1976d2;">${passwordCheck}</span>
        </p>
      </div>
      
      <p style="font-size: 14px; color: #555;">⚠️ Please change your password after first login for better security.</p>
      
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />
      
      <p style="font-size: 14px; color: #555; text-align: center;">
        Thank you, <br />
        <b style="color: #1976d2;">CRM Datasense Tech</b>
      </p>
    </div>
  `
                  }

                  const emailRes = emailSend(mailData)
                  sendResponse['appStatusCode'] = 0
                  sendResponse['message'] = 'User added Successfully'
                  sendResponse['payloadJson'] = result
                  sendResponse['error'] = ''
                  return NextResponse.json(sendResponse, { status: 200 })
                })
              }
            }
          } else {
            if (dData?.first_name === '') {
              sendResponse['appStatusCode'] = 4
              sendResponse['message'] = 'Please check first name'
              sendResponse['payloadJson'] = []
              sendResponse['error'] = []
            } else if (dData?.email === '') {
              sendResponse['appStatusCode'] = 4
              sendResponse['message'] = 'Please check email'
              sendResponse['payloadJson'] = []
              sendResponse['error'] = []
            } else if (dData?.password === '') {
              sendResponse['appStatusCode'] = 4
              sendResponse['message'] = 'Please check password'
              sendResponse['payloadJson'] = []
              sendResponse['error'] = []
            } else {
              const encEmail = encryptCryptoResponse(dData?.email)
              const encMobile = encryptCryptoResponse(dData?.mobile)
              const userdata = new User({
                organization_id: dData?.organization_id,
                user_id: create_UUID(),
                first_name: dData?.first_name,
                last_name: dData?.last_name,
                user_name,
                slug_name,
                email: encEmail,
                mobile: encMobile,
                c_about_user: dData?.c_about_user,
                role: dData?.role,
                c_role_id: dData?.c_role_id,
                c_user_img_url: dData?.c_user_img_url,
                password: hashPass,
                n_status: dData?.n_status ? dData?.n_status : 1
              })

              await userdata.save().then(async result => {
                if (result) {
                  let mailData = {
                    from: '"No Reply" <dhilipbeece001@gmail.com>', // sender address
                    to: `${dData?.email}`, // receiver
                    subject: '🔑 CRM Datasense - Login Credentials',
                    text: 'Your login credentials for CRM Datasense',
                    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; padding: 30px; background: #f9fafc;">
      
      <h2 style="text-align: center; color: #1976d2; margin-bottom: 20px;">CRM Datasense</h2>
      
      <p style="font-size: 15px; color: #333;">Hi <b>${user_name}</b>,</p>
      <p style="font-size: 15px; color: #333; line-height: 1.6;">
        Your account has been created successfully. Please find your login credentials below:
      </p>
      
      <div style="margin: 25px 0; padding: 15px; background: #e3f2fd; border-radius: 8px;">
        <p style="font-size: 16px; color: #333; margin: 5px 0;">
          📧 <b>Email:</b> <span style="color: #1976d2;">${dData?.email}</span>
        </p>
        <p style="font-size: 16px; color: #333; margin: 5px 0;">
          🔑 <b>Password:</b> <span style="color: #1976d2;">${passwordCheck}</span>
        </p>
      </div>
      
      <p style="font-size: 14px; color: #555;">⚠️ Please change your password after first login for better security.</p>
      
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />
      
      <p style="font-size: 14px; color: #555; text-align: center;">
        Thank you, <br />
        <b style="color: #1976d2;">CRM Datasense Tech</b>
      </p>
    </div>
  `
                  }

                  const emailRes = await emailSend(mailData)

                  if (emailRes) {
                    sendResponse['appStatusCode'] = 0
                    sendResponse['message'] = 'User added Successfully'
                    sendResponse['payloadJson'] = result
                    sendResponse['error'] = 'Email send successfully!'
                  } else {
                    sendResponse['appStatusCode'] = 0
                    sendResponse['message'] = 'User added Successfully'
                    sendResponse['payloadJson'] = result
                    sendResponse['error'] = 'Email could not send!'
                  }
                } else {
                  sendResponse['appStatusCode'] = 4
                  sendResponse['message'] = 'User Not added'
                  sendResponse['payloadJson'] = []
                  sendResponse['error'] = error
                }
              })
            }

            return NextResponse.json(sendResponse, { status: 200 })
          }
        } else if (dData?.role === 'admin') {
          sendResponse['appStatusCode'] = 0
          sendResponse['message'] = 'please check your role'
          sendResponse['payloadJson'] = []
          sendResponse['error'] = []
        }
      }

      return NextResponse.json(sendResponse, { status: 200 })
    }
  } catch (err) {
    sendResponse['appStatusCode'] = 4
    sendResponse['message'] = err
    sendResponse['payloadJson'] = []
    sendResponse['error'] = 'Something went wrong!!'

    return NextResponse.json(sendResponse, { status: 400 })
  }
}

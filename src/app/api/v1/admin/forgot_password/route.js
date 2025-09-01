import { NextResponse } from 'next/server'

import { urlEncoder } from 'encryptdecrypt-everytime/src'

import { generateAccessTokenForget, transporter } from '@/helper/clientHelper'

import { User } from '@/models/userModel'
import connectMongoDB from '@/libs/mongodb'
import { decrypCryptoRequest, encryptCryptoResponse } from '@/helper/frontendHelper'
import { Organization } from '@/models/organizationModel'

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

function findUserByEmail(dbUsers, loginEmail) {
  return dbUsers.find(user => {
    let emailToCheck

    // If value is AES encrypted (CryptoJS AES output starts with 'U2FsdGVkX1')
    if (user.email.startsWith('U2FsdGVkX1')) {
      try {
        emailToCheck = decrypCryptoRequest(user.email)
      } catch (err) {
        emailToCheck = null
      }
    } else {
      emailToCheck = user.email // Already plain text
    }

    return emailToCheck?.toLowerCase() === loginEmail.toLowerCase()
  })
}

export async function POST(request) {
  const { email, c_redirect } = await request.json()

  try {
    await connectMongoDB()

    const encEmail = encryptCryptoResponse(email)

    await User.find({
      n_status: 1,
      n_published: 1
    }).then(async respon => {
      const dbUsers = respon.map(user => ({ email: user.email }))

      const matchedUser = findUserByEmail(dbUsers, email)

      const dataArray = respon.filter(user => user.email.startsWith(matchedUser.email))
      const dataValue = dataArray?.length > 0 ? dataArray[0] : {}

      // const listRes = await UserRole.findOne({ c_role_id: data.c_role_id.trim() })
      // const orgData = await Organization.findOne({ organization_id: data.organization_id })

      if (dataValue) {
        let data = {
          email: decrypCryptoRequest(dataValue.email),
          _id: dataValue._id
        }

        let token = generateAccessTokenForget(data)

        const sampleData = [token]
        const secretKey = process.env.NEXT_PUBLIC_ENCY_DECY_SECRET

        const encryptedToken = urlEncoder(secretKey, JSON.stringify(sampleData))

        let mailData = {
          from: '"No Reply" <dhilipbeece001@gmail.com>', // sender address
          to: `${data.email}`, // receiver
          subject: '🔒 CRM Datasense - Password Reset',
          text: 'Password reset link for CRM Datasense',
          html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; padding: 30px; background: #f9fafc;">
      
      <h2 style="text-align: center; color: #1976d2; margin-bottom: 20px;">CRM Datasense</h2>
      
      <p style="font-size: 15px; color: #333;">Hi <b>${dataValue.first_name} ${dataValue.last_name}</b>,</p>
      <p style="font-size: 15px; color: #333; line-height: 1.6;">
        We received a request to reset your password. Please click the button below to set a new password:
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${c_redirect}/token?${encryptedToken}" 
           style="background-color: #1976d2; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block;">
          🔑 Reset Password
        </a>
      </div>
      
      <p style="font-size: 14px; color: #555; line-height: 1.6;">
        If the button above doesn't work, copy and paste the following link into your browser:
      </p>
      <p style="font-size: 14px; color: #1976d2; word-break: break-all;">
        ${c_redirect}/token?${encryptedToken}
      </p>
      
      <p style="font-size: 14px; color: #555; margin-top: 20px;">⚠️ This link will expire after <b>15 minutes</b> for security reasons.</p>
      
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />
      
      <p style="font-size: 14px; color: #555; text-align: center;">
        Thank you, <br />
        <b style="color: #1976d2;">CRM Datasense Team</b>
      </p>
    </div>
  `
        }

        // console.log(mailData, '<<< DATAVALUEEEEEE')


        const result = emailSend(mailData)

        if (result) {
          sendResponse['appStatusCode'] = 0
          sendResponse['message'] = 'Please check your email'
          sendResponse['payloadJson'] = []
          sendResponse['error'] = ''
        } else {
          sendResponse['appStatusCode'] = 4
          sendResponse['message'] = ''
          sendResponse['payloadJson'] = []
          sendResponse['error'] = err
        }

        return NextResponse.json(sendResponse, { status: 200 })
      } else {
        sendResponse['appStatusCode'] = 4
        sendResponse['message'] = ''
        sendResponse['payloadJson'] = []
        sendResponse['error'] = 'Email is not registered with us!'
      }

      return NextResponse.json(sendResponse, { status: 200 })
    })

    return NextResponse.json(sendResponse, { status: 200 })
  } catch (err) {
    sendResponse['appStatusCode'] = 4
    sendResponse['message'] = ''
    sendResponse['payloadJson'] = []
    sendResponse['error'] = 'Something went wrong!!!'

    return NextResponse.json(sendResponse, { status: 400 })
  }
}

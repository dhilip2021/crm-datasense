import { NextResponse } from 'next/server'

import connectMongoDB from '@/libs/mongodb'
import { transporter } from '@/helper/clientHelper'
import { User } from '@/models/userModel'
import { OTP } from '@/models/otpModel'

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
  const { email } = await request.json()
  try {
    await connectMongoDB()

    await User.findOne({
      email: email
    })
      .then(async data => {
        if (data) {
          sendResponse['appStatusCode'] = 4
          sendResponse['message'] = ''
          sendResponse['payloadJson'] = []
          sendResponse['error'] = 'This user already registered!'

          return NextResponse.json(sendResponse, { status: 200 })
        } else {
          const otpValue = Math.floor(1000 + Math.random() * 9000)
          let mailData = {
            from: '"No Reply" <dhilipbeece001@gmail.com>',
            to: `${email}`,
            subject: '🔐 Email OTP Verification - Lumivo CRM - Datasense Technologies',
            text: 'Your OTP for CRM DATA SENSE verification',
            html: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; padding: 30px; background: #f9fafc;">
    
    <h2 style="text-align: center; color: #1976d2; margin-bottom: 20px;">CRM DATA SENSE</h2>
    
    <p style="font-size: 15px; color: #333;">Hi,</p>
    <p style="font-size: 15px; color: #333; line-height: 1.6;">
      To activate your account, please use the following One-Time Password (OTP):
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 28px; font-weight: bold; color: #1976d2; letter-spacing: 3px; background: #e3f2fd; padding: 10px 20px; border-radius: 8px; display: inline-block;">
        ${otpValue}
      </span>
    </div>
    
    <p style="font-size: 14px; color: #555;">⚠️ This OTP is valid for <b>5 minutes</b> only.</p>
    <p style="font-size: 14px; color: #555;">❌ Do not share this OTP with anyone for security reasons.</p>
    
    <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />
    
    <p style="font-size: 14px; color: #555; text-align: center;">
      Regards, <br />
      <b style="color: #1976d2;">CRM DATA SENSE Team</b>
    </p>
  </div>
  `
          }

          const resultData = emailSend(mailData)

          if (resultData) {
            sendResponse['appStatusCode'] = 0
            sendResponse['message'] = 'OTP Send Successfully'
            sendResponse['payloadJson'] = []
            sendResponse['error'] = ''

            // return NextResponse.json(sendResponse, { status: 200 });

            let otpAdd = new OTP({
              otp: otpValue,
              email
            })

            await otpAdd
              .save()
              .then(() => {
                sendResponse['appStatusCode'] = 0
                sendResponse['message'] = 'OTP Send Successfully'
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
          } else {
            sendResponse['appStatusCode'] = 4
            sendResponse['message'] = ''
            sendResponse['payloadJson'] = []
            sendResponse['error'] = err
            return NextResponse.json(sendResponse, { status: 200 })
          }
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
    sendResponse['error'] = err
    return NextResponse.json(sendResponse, { status: 400 })
  }
}

export async function GET(request) {}

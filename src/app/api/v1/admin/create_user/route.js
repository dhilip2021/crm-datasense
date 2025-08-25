import { NextResponse } from 'next/server'

import slugify from 'slugify'

import connectMongoDB from '@/libs/mongodb'

import { User } from '@/models/userModel'
import { create_UUID, transporter } from '@/helper/clientHelper'
import { decrypCryptoRequest, encryptCryptoResponse } from '@/helper/frontendHelper'

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

  console.log(dData, '<<< DECRYPT DATAAAA')

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
        const body = {
          organization_id: dData?.organization_id,
          first_name: dData?.first_name,
          last_name: dData?.last_name,
          user_name: user_name,
          c_about_user: dData?.c_about_user,
          slug_name: slug_name,
          email: encEmail,
          mobile: dData?.mobile,
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
            console.log('coming 1')

            let data = {
              organization_id: dData?.organization_id,
              role: 'admin'
            }
            const resulData = await User.find(data)
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

            if (resulData.length === 0 || resulData === null) {
              await userdata.save().then(result => {
                let mailData = {
                  from: '"No Reply" <dhilipbeece001@gmail.com>', // sender address
                  to: `${dData?.email}`, // list of receivers
                  subject: 'CRM Datasense Login Credential',
                  text: 'Login Credential',
                  html: ``
                }

                mailData['html'] = `
              <b>Hai ${user_name},</b>
              <h4>Your Login Credential</h4>
              <h4>your email : <b>${dData?.email} </b></h4>
              <h4>your password : <b>${passwordCheck} </b></h4>
              <h5><b>Thank you, </b> <br /> CRM Datasense</h5>
            `
                const emailRes = emailSend(mailData)

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
              })
            } else {
              if (resulData[0].role === 'admin') {
                sendResponse['appStatusCode'] = 4
                sendResponse['message'] = 'This access not allowed'
                sendResponse['payloadJson'] = []
                sendResponse['error'] = []
              } else {
                sendResponse['appStatusCode'] = 4
                sendResponse['message'] = 'other role not allowed'
                sendResponse['payloadJson'] = []
                sendResponse['error'] = []
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
                    to: `${dData?.email}`, // list of receivers
                    subject: 'CRM Datasense Login Credential',
                    text: 'Login Credential',
                    html: ``
                  }

                  mailData['html'] = `
              <b>Hai ${user_name},</b>
              <h4>Your Login Credential</h4>
              <h4>your email : <b>${dData?.email} </b></h4>
              <h4>your password : <b>${passwordCheck} </b></h4>
              <h5><b>Thank you, </b> <br /> CRM Datasense Tech</h5>
            `
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

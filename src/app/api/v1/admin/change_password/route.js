import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import connectMongoDB from '@/libs/mongodb'
import { verifyAccessToken } from '@/helper/clientHelper'
import { User } from '@/models/userModel'
import bcrypt from 'bcryptjs'

let sendResponse = {
  appStatusCode: '',
  message: '',
  payloadJson: [],
  error: ''
}

export async function POST(request) {
  const verified = verifyAccessToken()

  console.log(verified,"<<< VERIFIEDDDOOO")



  const { c_old_pass, c_new_pass, c_confirm_pass } = await request.json()

  try {
    await connectMongoDB()

    if (!verified.success) {
      return NextResponse.json(
        {
          appStatusCode: 4,
          message: '',
          payloadJson: [],
          error: 'Token expired!'
        },
        { status: 200 }
      )
    }

    // get user from DB
    const user = await User.findById(new mongoose.Types.ObjectId(verified.data._id))
    if (!user) {
      return NextResponse.json(
        {
          appStatusCode: 4,
          message: '',
          payloadJson: [],
          error: 'User not found'
        },
        { status: 200 }
      )
    }

    // check old password if provided
    if (c_old_pass) {
      const isMatch = await bcrypt.compare(c_old_pass, user.password)
      if (!isMatch) {
        return NextResponse.json(
          {
            appStatusCode: 4,
            message: '',
            payloadJson: [],
            error: 'Old password is wrong'
          },
          { status: 200 }
        )
      }
    }

    // confirm new password
    if (c_new_pass !== c_confirm_pass) {
      return NextResponse.json(
        {
          appStatusCode: 4,
          message: '',
          payloadJson: [],
          error: 'Password mismatch'
        },
        { status: 200 }
      )
    }

    // hash and update
    const hashPass = await bcrypt.hash(c_new_pass, 10)
    const updatedUser = await User.findByIdAndUpdate(
      new mongoose.Types.ObjectId(verified.data._id),
      { $set: { password: hashPass } },
      { new: true }
    )

    return NextResponse.json(
      {
        appStatusCode: 0,
        message: 'Your password has been changed!',
        payloadJson: updatedUser,
        error: ''
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('Password change error:', err)
    return NextResponse.json(
      {
        appStatusCode: 4,
        message: '',
        payloadJson: [],
        error: err.message || 'Something went wrong'
      },
      { status: 400 }
    )
  }
}

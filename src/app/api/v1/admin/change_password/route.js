import { NextResponse } from "next/server";


import { verifyAccessToken } from "../../../../../helper/helper";
import connectMongoDB from "@/libs/mongodb";

import { User } from "@/models/userModel";

const bcrypt = require("bcryptjs");

let sendResponse = {
  appStatusCode: "",
  message: "",
  payloadJson: [],
  error: "",
};

export async function POST(request) {
  const verified = verifyAccessToken();
  const { c_old_pass, c_new_pass, c_confirm_pass } = await request.json();

  try {
    await connectMongoDB();

    if (verified.success) {
      if (c_old_pass) {
        if (c_old_pass === verified.data.password) {
          if (c_new_pass === c_confirm_pass) {
            const hashPass = await bcrypt.hash(c_new_pass, 10);

            await User.findOneAndUpdate(
              { email: verified.data.email },
              {
                $set: { password: hashPass },
              }
            )
              .then((data) => {
                sendResponse["appStatusCode"] = 0;
                sendResponse["message"] = "your password has been changed !";
                sendResponse["payloadJson"] = data;
                sendResponse["error"] = "";
              })
              .catch((error) => {
                sendResponse["appStatusCode"] = 4;
                sendResponse["message"] = "";
                sendResponse["payloadJson"] = [];
                sendResponse["error"] = error;
              });

            return NextResponse.json(sendResponse, { status: 200 });
          } else {
            sendResponse["appStatusCode"] = 4;
            sendResponse["message"] = "";
            sendResponse["payloadJson"] = [];
            sendResponse["error"] = "Password Mismatch";

            return NextResponse.json(sendResponse, { status: 200 });
          }
        } else {
          sendResponse["appStatusCode"] = 4;
          sendResponse["message"] = "";
          sendResponse["payloadJson"] = [];
          sendResponse["error"] = "Old Password is wrong";

          return NextResponse.json(sendResponse, { status: 200 });
        }
      } else {
        if (c_new_pass === c_confirm_pass) {
          const hashPass = await bcrypt.hash(c_new_pass, 10);

          await User.findOneAndUpdate(
            { email: verified.data.email },
            {
              $set: { password: hashPass },
            }
          ).then((data) => {
              sendResponse["appStatusCode"] = 0;
              sendResponse["message"] = "your password has been changed !";
              sendResponse["payloadJson"] = data;
              sendResponse["error"] = "";
            })
            .catch((error) => {
              sendResponse["appStatusCode"] = 4;
              sendResponse["message"] = "";
              sendResponse["payloadJson"] = [];
              sendResponse["error"] = error;
            });

          return NextResponse.json(sendResponse, { status: 200 });
        } else {
          sendResponse["appStatusCode"] = 4;
          sendResponse["message"] = "";
          sendResponse["payloadJson"] = [];
          sendResponse["error"] = "Password Mismatch";

          if (sendResponse.appStatusCode !== "") {
            return NextResponse.json(sendResponse, { status: 200 });
          }
        }
      }
    } else {
      sendResponse["appStatusCode"] = 4;
      sendResponse["message"] = "";
      sendResponse["payloadJson"] = [];
      sendResponse["error"] = "token expired!";

      if (sendResponse.appStatusCode !== "") {
        return NextResponse.json(sendResponse, { status: 200 });
      }
    }
  } catch (err) {
    sendResponse["appStatusCode"] = 4;
    sendResponse["message"] = "";
    sendResponse["payloadJson"] = [];
    sendResponse["error"] = "Something went wrong";
    
    if (sendResponse.appStatusCode !== "") {
      return NextResponse.json(sendResponse, { status: 400 });
    }
  }
}

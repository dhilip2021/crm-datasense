import { NextResponse } from "next/server";
import { create_UUID } from "@/helper/clientHelper";
import connectMongoDB from "@/libs/mongodb";
import { FcmDeviceToken } from "@/models/fcmDeviceTokenModel";

let sendResponse = {
  appStatusCode: "",
  message: "",
  payloadJson: [],
  error: "",
};

export async function POST(request) {
  const {
    c_fcm_device_id,
    c_fcm_device_type,
    c_fcm_device_token,
    c_user_id,
    Id,
    n_status,
  } = await request.json();

  try {
    await connectMongoDB();
      if (Id) {
        const WebstoryId = await FcmDeviceToken.findOne({
          _id: Id,
        });

        if (WebstoryId === null) {
          sendResponse["appStatusCode"] = 4;
          sendResponse["message"] = [];
          sendResponse["payloadJson"] = [];
          sendResponse["error"] = "Please enter valid id!";
          return NextResponse.json(sendResponse, { status: 200 });
        } else {
          const body = {
            c_fcm_device_id: c_fcm_device_id,
            c_fcm_device_type: c_fcm_device_type,
            c_fcm_device_token:c_fcm_device_token,
            c_user_id: c_user_id,
            n_status: n_status,
          };

          await FcmDeviceToken.findByIdAndUpdate(Id, body)
            .then(() => {
              sendResponse["appStatusCode"] = 0;
              sendResponse["message"] = "Updated Successfully!";
              sendResponse["payloadJson"] = [];
              sendResponse["error"] = [];
            })
            .catch((err) => {
              sendResponse["appStatusCode"] = 4;
              sendResponse["message"] = "Invalid Id";
              sendResponse["payloadJson"] = [];
              sendResponse["error"] = err;
            });

          return NextResponse.json(sendResponse, { status: 200 });
        }
      } else {
        const deviceId = await FcmDeviceToken.findOne({
          c_fcm_device_token: c_fcm_device_token,
        });

        if (c_fcm_device_token === "") {
          sendResponse["appStatusCode"] = 4;
          sendResponse["message"] = [];
          sendResponse["payloadJson"] = [];
          sendResponse["error"] = "Please enter FcmDeviceToken!";
          return NextResponse.json(sendResponse, { status: 200 });
        } else if (deviceId) {
          const body = {
            c_fcm_device_id: c_fcm_device_id,
            c_fcm_device_type: c_fcm_device_type,
            c_fcm_device_token:c_fcm_device_token,
            c_user_id: c_user_id
          };

          await FcmDeviceToken.findByIdAndUpdate(deviceId._id, body)
            .then(() => {
              sendResponse["appStatusCode"] = 0;
              sendResponse["message"] = "Updated Successfully!";
              sendResponse["payloadJson"] = [];
              sendResponse["error"] = [];
            })
            .catch((err) => {
              sendResponse["appStatusCode"] = 4;
              sendResponse["message"] = "Invalid Id";
              sendResponse["payloadJson"] = [];
              sendResponse["error"] = err;
            });

          return NextResponse.json(sendResponse, { status: 200 });

        } else {
          let fcmDeviceTokenData = new FcmDeviceToken({
            c_fcm_id: create_UUID(),
            c_fcm_device_id: c_fcm_device_id,
            c_fcm_device_type: c_fcm_device_type,
            c_fcm_device_token:c_fcm_device_token,
            c_user_id: c_user_id
          });

          await fcmDeviceTokenData.save()
            .then(() => {
              sendResponse["appStatusCode"] = 0;
              sendResponse["message"] = "Added Successfully!";
              sendResponse["payloadJson"] = [];
              sendResponse["error"] = [];
            })
            .catch((err) => {
              sendResponse["appStatusCode"] = 4;
              sendResponse["message"] = "";
              sendResponse["payloadJson"] = [];
              sendResponse["error"] = err;
            });
        }
        return NextResponse.json(sendResponse, { status: 200 });
      }
 
  } catch (err) {
    sendResponse["appStatusCode"] = 4;
    sendResponse["message"] = "";
    sendResponse["payloadJson"] = [];
    sendResponse["error"] = "Something went wrong!";
    return NextResponse.json(sendResponse, { status: 400 });
  }
}

export async function GET() {
  sendResponse["appStatusCode"] = 0;
  sendResponse["message"] = "";
  sendResponse["payloadJson"] = [];
  sendResponse["error"] = "";
  return NextResponse.json(sendResponse, { status: 200 });
}

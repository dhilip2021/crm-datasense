import admin from "firebase-admin";
import { Message } from "firebase-admin/messaging";
import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/libs/mongodb";
import { FcmDeviceToken } from "@/models/fcmDeviceTokenModel";

if (!admin.apps.length) {
  // const serviceAccount = require("@/service_key.json");
  const serviceAccount = require("../../../../../service_key.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

let sendResponse = {
  appStatusCode: "",
  message: "",
  payloadJson: [],
  error: "",
};



export async function POST(request) {
  const { title, message, link, icon, c_type } = await request.json();

  console.log(title,"<< TITLEEEE")



  const messages = {
    notification: {
      title,
      body: message,
      image: icon || undefined, // only if icon provided
    },
    data: {
      link: link || "",
      imageUrl: icon || "",
      title: title || "",
      body: message || "",
    },
    android: {
      priority: "high",
    },
    apns: {
      headers: {
        "apns-priority": "10",
      },
      payload: {
        aps: {
          alert: {
            title,
            body: message,
          },
          sound: "default",
          badge: 1,
          "content-available": 1, // ✅ correct key for iOS
        },
      },
    },
    webpush: link ? { fcmOptions: { link } } : undefined,
  };



  const sendNotifications = async (registrationTokens, messages) => {
    const BATCH_SIZE = 500; // FCM's limit
    let allResponses= [];



    for (let i = 0; i < registrationTokens?.length; i += BATCH_SIZE) {
      const batch = registrationTokens.slice(i, i + BATCH_SIZE);
      try {
        const response = await admin.messaging().sendEachForMulticast({
          tokens: batch,
          notification: messages.notification,
          android: messages.android,
          apns: messages.apns,
          webpush: messages.webpush,
          data: messages.data
        });

        response.responses.forEach((res, index) => {
          if (!res.success) {
            const token = batch[index];
            const errorCode = res.error.code;

            if (errorCode === "messaging/registration-token-not-registered") {
              removeTokenFromDatabase(registrationTokens, token);
            } else {
              console.error(`Failed to send to token ${token}:`, res.error.message);
            }
          }
        });

        allResponses.push(response);
      } catch (error) {
        console.error("Error sending batch notifications:", error);
      }
    }

    return allResponses; // Return aggregated results
  };


  // Mock function to remove invalid tokens from the database
  const removeTokenFromDatabase = async (registrationTokens, token) => {

    const delteResponse = await FcmDeviceToken.deleteMany({ c_fcm_device_token: { $in: token } });
    const index = registrationTokens.indexOf(token);
    if (index > -1) {
      registrationTokens.splice(index, 1);
    }
  };

  const fetchAllTokens = async (c_type) => {
    let registrationTokens = [];
    let page = 0;
    const PAGE_SIZE = 1000; // Fetch 1000 at a time

    while (true) {
      const result = await FcmDeviceToken.find({ c_fcm_device_type: c_type })
        .skip(page * PAGE_SIZE)
        .limit(PAGE_SIZE);

      if (result.length === 0) break; // Stop when no more records

      registrationTokens.push(...result.map((data) => data.c_fcm_device_token));
      page++;
    }

    return registrationTokens;
  };


  try {

    if (c_type === "web") {
      await connectMongoDB();
      const registrationTokens = await fetchAllTokens(c_type);


      if (registrationTokens?.length > 0) {
        const resultData = await sendNotifications(registrationTokens, messages);

        if (resultData[0]?.successCount > 0) {
          sendResponse["appStatusCode"] = 0;
          sendResponse["message"] = "Notification send successfully!";
          sendResponse["payloadJson"] = resultData;
          sendResponse["error"] = registrationTokens?.length;
          return NextResponse.json(sendResponse, { status: 200 });
        } else {
          sendResponse["appStatusCode"] = 4;
          sendResponse["message"] = "Notification send failure!";
          sendResponse["payloadJson"] = resultData;
          sendResponse["error"] = registrationTokens?.length;
          return NextResponse.json(sendResponse, { status: 400 });
        }

      } else {
        sendResponse["appStatusCode"] = 4;
        sendResponse["message"] = "";
        sendResponse["payloadJson"] = [];
        sendResponse["error"] = "cannot found registration token";
      }

      return NextResponse.json(sendResponse, { status: 200 });
    }

    return NextResponse.json(sendResponse, { status: 200 });
  } catch (error) {
    sendResponse["appStatusCode"] = 4;
    sendResponse["message"] = "Notification send failure!";
    sendResponse["payloadJson"] = [];
    sendResponse["error"] = error;
    return NextResponse.json(sendResponse, { status: 400 });
  }
}

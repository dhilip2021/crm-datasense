import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/helper/clientHelper";
import connectMongoDB from "@/libs/mongodb";
import { Notification } from "@/models/notificationModel";

let sendResponse = {
  appStatusCode: "",
  message: "",
  payloadJson: [],
  error: "",
};


export async function DELETE(request) {
  const userId = request.nextUrl.searchParams.get("id"); // this is c_user_id
  const verified = verifyAccessToken();

  await connectMongoDB();

  let sendResponse = {
    appStatusCode: "",
    message: "",
    payloadJson: [],
    error: "",
  };

  if (!verified.success) {
    return NextResponse.json(
      {
        appStatusCode: 4,
        message: "",
        payloadJson: [],
        error: "token expired!",
      },
      { status: 400 }
    );
  }

  try {
    const updateResult = await Notification.updateMany(
      {
        c_send_to: {
          $elemMatch: {
            c_user_id: userId
          }
        }
      },
      {
        $set: {
          n_status: 0,
          n_published: 0,
          c_deletedBy: verified.data.user_id
        }
      }
    );

    if (updateResult.modifiedCount > 0) {
      sendResponse.appStatusCode = 0;
      sendResponse.message = `${updateResult.modifiedCount} notifications updated`;
    } else {
      sendResponse.appStatusCode = 4;
      sendResponse.message = "No notifications found for this user";
    }

    return NextResponse.json(sendResponse, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      {
        appStatusCode: 4,
        message: "",
        payloadJson: [],
        error: "Something went wrong!",
      },
      { status: 400 }
    );
  }
}



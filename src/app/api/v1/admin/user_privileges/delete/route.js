import { NextResponse } from "next/server";
import { UserPrivileges } from "../../../../../../models/userPrivilegesModel";
import connectMongoDB from "../../../../../../libs/mongodb";
import { verifyAccessToken } from "@/helper/helper";

let sendResponse = {
  appStatusCode: "",
  message: "",
  payloadJson: [],
  error: "",
};



export async function DELETE(request) {
  const id = request.nextUrl.searchParams.get("id");
  await connectMongoDB();
  const verified = verifyAccessToken();
  try {
    if (verified.success) {
      const body = {
        n_status: 0,
        n_published: 0,
        c_deletedBy: verified.data.user_id,
      };

      await UserPrivileges.findByIdAndUpdate(id, body)
        .then((result) => {
          if (result) {
            sendResponse["appStatusCode"] = 0;
            sendResponse["message"] = "Deleted Successfully";
            sendResponse["payloadJson"] = [];
            sendResponse["error"] = "";
          } else {
            sendResponse["appStatusCode"] = 4;
            sendResponse["message"] = "";
            sendResponse["payloadJson"] = [];
            sendResponse["error"] = "Invalid Id";
          }
        })
        .catch((err) => {
          sendResponse["appStatusCode"] = 4;
          sendResponse["message"] = "";
          sendResponse["payloadJson"] = [];
          sendResponse["error"] = err;
        });
      return NextResponse.json(sendResponse, { status: 200 });
    } else {
      sendResponse["appStatusCode"] = 4;
      sendResponse["message"] = [];
      sendResponse["payloadJson"] = [];
      sendResponse["error"] = verified.error;
      return NextResponse.json(sendResponse, { status: 200 });
    }
  } catch (error) {
    sendResponse["appStatusCode"] = 4;
    sendResponse["message"] = [];
    sendResponse["payloadJson"] = [];
    sendResponse["error"] = "Something went wrong!";
    return NextResponse.json(sendResponse, { status: 400 });
  }
}

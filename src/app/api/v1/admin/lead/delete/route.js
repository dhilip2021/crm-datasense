import { NextResponse } from "next/server";


import { Lead } from "@/models/leadModel";
import { verifyAccessToken } from "@/helper/helper";
import connectMongoDB from "@/libs/mongodb";

let sendResponse = {
  appStatusCode: "",
  message: "",
  payloadJson: [],
  error: "",
};

export async function DELETE(request) {
  const id = request.nextUrl.searchParams.get("id");
  const verified = verifyAccessToken();
  
  await connectMongoDB();

  if (verified.success) {
    const body = {
      n_status: 0,
      n_published: 0,
      c_deletedBy: verified.data.user_id,
    };

    

    try {
      await Lead.findByIdAndUpdate(id, body).then((result) => {
        if (result) {
          sendResponse["appStatusCode"] = 0;
          sendResponse["message"] = "Deleted Successfully";
          sendResponse["payloadJson"] = [];
          sendResponse["error"] = "";
        } else {
          sendResponse["appStatusCode"] = 0;
          sendResponse["message"] = "Cannot Delete ! please check again";
          sendResponse["payloadJson"] = [];
          sendResponse["error"] = "";
        }
      });
    } catch (err) {
      sendResponse["appStatusCode"] = 4;
      sendResponse["message"] = "";
      sendResponse["payloadJson"] = [];
      sendResponse["error"] = "Something went wrong!";

      return NextResponse.json(sendResponse, { status: 400 });
    }

    return NextResponse.json(sendResponse, { status: 200 });
  } else {
    sendResponse["appStatusCode"] = 4;
    sendResponse["message"] = "";
    sendResponse["payloadJson"] = [];
    sendResponse["error"] = "token expired!";

    return NextResponse.json(sendResponse, { status: 400 });
  }
}

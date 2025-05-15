import { NextResponse } from "next/server";

import { UserRole } from "@/models/userRoleModel";
import connectMongoDB from "@/libs/mongodb";



let sendResponse = {
  appStatusCode: "",
  message: "",
  payloadJson: [],
  error: "",
};

export async function DELETE(request) {
    const id = request.nextUrl.searchParams.get("id");

    await connectMongoDB();


    const body = {
        n_status : 0,
        n_published: 0,
      };

      await UserRole.findByIdAndUpdate(id, body).then((result) => {
      sendResponse["appStatusCode"] = 0;
      sendResponse["message"] = "Deleted Successfully";
      sendResponse["payloadJson"] = [];
      sendResponse["error"] = "Something went wrong!";
    });
    
    return NextResponse.json(sendResponse, { status: 200 });
}
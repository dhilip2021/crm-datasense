import { NextResponse } from "next/server";

import { User } from "../../../../../models/userModel";
import connectMongoDB from "@/libs/mongodb";

let sendResponse = {
  appStatusCode: "",
  message: "",
  payloadJson: [],
  error: "",
};

export async function POST(request) {
  const {email} = await request.json();

try {
  await connectMongoDB();

    if (email !== "" && email !== undefined) {
      await User.findOne({
        email: email,
      }).then((response) => {
        if (!response) {
          sendResponse["appStatusCode"] = 0;
          sendResponse["message"] = "User Details";
          sendResponse["data"] = "";
          sendResponse["error"] = [];
        } else {
          sendResponse["appStatusCode"] = 4;
          sendResponse["message"] = "User Already Exists!";
          sendResponse["data"] = "";
          sendResponse["error"] = [];
        }
      });
    }else if(email === undefined){
        sendResponse["appStatusCode"] = 4;
        sendResponse["message"] = "Please check your payload!";
        sendResponse["data"] = "";
        sendResponse["error"] = [];
        
    }else{
          sendResponse["appStatusCode"] = 4;
          sendResponse["message"] = "Please enter valid email!";
          sendResponse["data"] = "";
          sendResponse["error"] = [];
    }

    return NextResponse.json(sendResponse, { status: 200 });
  } catch {
    (err) => {
      sendResponse["appStatusCode"] = 4;
      sendResponse["message"] = "Something went wrong";
      sendResponse["data"] = [];
      sendResponse["error"] = err;
      
      return NextResponse.json(sendResponse, { status: 400 });
    };
  }

   
}



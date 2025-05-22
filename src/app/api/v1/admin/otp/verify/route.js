import { NextResponse } from "next/server";

import connectMongoDB from "@/libs/mongodb";

import { OTP } from "@/models/otpModel";


let sendResponse = {
  appStatusCode: "",
  message: "",
  payloadJson: [],
  error: "",
};


export async function POST(request) {
  const { email,otp } = await request.json();
  try{
    await connectMongoDB();

    const otpData = await OTP.findOne({email:email, n_status: 1,n_published : 1}).sort({ createdAt: -1 });


    if(email === ""){
        sendResponse["appStatusCode"] = 4;
        sendResponse["message"] = "Email cannot be empty!";
        sendResponse["payloadJson"] = [];
        sendResponse["error"] = "";
        return NextResponse.json(sendResponse, { status: 200 });
    }else if(otp === ""){
        sendResponse["appStatusCode"] = 4;
        sendResponse["message"] = "OTP cannot be empty!";
        sendResponse["payloadJson"] = [];
        sendResponse["error"] = "";
        return NextResponse.json(sendResponse, { status: 200 });
    }else if(otpData === null){
        sendResponse["appStatusCode"] = 4;
        sendResponse["message"] = "Invalid Email or OTP!";
        sendResponse["payloadJson"] = [];
        sendResponse["error"] = "";
        return NextResponse.json(sendResponse, { status: 200 });
    }else {

        if(otpData.otp === otp){
            await OTP.updateMany(
                { email: email },
                {
                  $set: {n_status: 0, n_published : 0},
                }
              ).then((data) => {
                
                    sendResponse["appStatusCode"] = 0;
                    sendResponse["message"] = "OTP verified done!";
                    sendResponse["payloadJson"] = [];
                    sendResponse["error"] = "";
                })
                .catch((error) => {
                  sendResponse["appStatusCode"] = 4;
                  sendResponse["message"] = "";
                  sendResponse["payloadJson"] = [];
                  sendResponse["error"] = error;
                });
              return NextResponse.json(sendResponse, { status: 200 });



        }else {
            sendResponse["appStatusCode"] = 4;
        sendResponse["message"] = "Invalid OTP!";
        sendResponse["payloadJson"] = [];
        sendResponse["error"] = "";
        return NextResponse.json(sendResponse, { status: 200 });
        }

    }


    return NextResponse.json(sendResponse, { status: 200 });
  }catch(err){
    sendResponse["appStatusCode"] = 4;
    sendResponse["message"] = "";
    sendResponse["payloadJson"] = [];
    sendResponse["error"] = err;
    return NextResponse.json(sendResponse, { status: 400 });
  }

  
}

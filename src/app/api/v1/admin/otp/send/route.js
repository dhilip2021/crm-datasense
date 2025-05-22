import { NextResponse } from "next/server";



import connectMongoDB from "@/libs/mongodb";
import { transporter } from "@/helper/helper";
import { User } from "@/models/userModel";
import { OTP } from "@/models/otpModel";

let sendResponse = {
  appStatusCode: "",
  message: "",
  payloadJson: [],
  error: "",
};

function  emailSend( mailData) {
  return new Promise(async (resolve, reject) => {
    await transporter.sendMail(mailData, function async(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });


  });
}


export async function POST(request) {
  const { email } = await request.json();
  try{
    await connectMongoDB();

    await User.findOne({
      email: email,
    })
      .then(async (data) => {
        if(data){
          sendResponse["appStatusCode"] = 4;
          sendResponse["message"] = "";
          sendResponse["payloadJson"] = [];
          sendResponse["error"] = "This user already registered!";
        
        return NextResponse.json(sendResponse, { status: 200 });
      }else{
        const otpValue = Math.floor(1000 + Math.random() * 9000);
          let mailData = {
            from: '"No Reply" <polimertv2012@gmail.com>', // sender address
              to: `${email}`, // list of receivers
              subject: "Email OTP verification from CRM DATA SENSE",
              text: "OTP MESSAGE",
              html: ``,
            };
            mailData["html"] = `
            <b>Hi,</b>
            <p>To activate your account, use the following OTP.</p>
            <h2><b>${otpValue}</b>.</h2> <p>OTP valid only for 5 mins.</p>
            <p>Do not share with anyone.</p>
            <p>Regards, <br /> CRM DATA SENSE</p>
          `;
      
            const resultData = emailSend(mailData)
      
            if(resultData){

              sendResponse["appStatusCode"] = 0;
              sendResponse["message"] = "OTP Send Successfully";
              sendResponse["payloadJson"] = [];
              sendResponse["error"] = "";


              // return NextResponse.json(sendResponse, { status: 200 });

              let otpAdd = new OTP({
                  otp: otpValue,
                  email,
                });

                await otpAdd.save().then(() => {
                  sendResponse["appStatusCode"] = 0;
                  sendResponse["message"] = "OTP Send Successfully";
                  sendResponse["payloadJson"] = [];
                  sendResponse["error"] = [];
                })
                .catch((err) => {
                  sendResponse["appStatusCode"] = 4;
                  sendResponse["message"] = "";
                  sendResponse["payloadJson"] = [];
                  sendResponse["error"] = err;
                });
              return NextResponse.json(sendResponse, { status: 200 });

              
            }else{
              sendResponse["appStatusCode"] = 4;
              sendResponse["message"] = "";
              sendResponse["payloadJson"] = [];
              sendResponse["error"] = err;
              return NextResponse.json(sendResponse, { status: 200 });
            }
            
      }
      })
      .catch((err) => {
        sendResponse["appStatusCode"] = 4;
        sendResponse["message"] = "";
        sendResponse["payloadJson"] = [];
        sendResponse["error"] = err;
      });




    return NextResponse.json(sendResponse, { status: 200 });
  }catch(err){
    sendResponse["appStatusCode"] = 4;
    sendResponse["message"] = "";
    sendResponse["payloadJson"] = [];
    sendResponse["error"] = err;
    return NextResponse.json(sendResponse, { status: 400 });
  }

  
}

export async function GET(request) {
}

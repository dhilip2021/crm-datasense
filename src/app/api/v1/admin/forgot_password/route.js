import { NextResponse } from "next/server";

import { User } from "../../../../../models/userModel";

import connectMongoDB from "../../../../../libs/mongodb";


import {
    generateAccessTokenForget,
    transporter,
} from "../../../../../helper/helper";

const { urlEncoder } = require("encryptdecrypt-everytime/src");

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
  const { email, c_redirect } = await request.json();

  try {
    await connectMongoDB();
    await User.findOne({
      email: email,
    }).then(async (userData) => {



      
      if(userData) {
        let data = {
          email: userData.email,
          id: userData._id,
        };
        let token = generateAccessTokenForget(data);
        

        const sampleData = [token];
        const secretKey = process.env.NEXT_PUBLIC_ENCY_DECY_SECRET;

        const encryptedToken = urlEncoder(
          secretKey,
          JSON.stringify(sampleData)
        );

        let mailData = {
          from: '"No Reply" <polimertv2012@gmail.com>', // sender address
          to: `${email}`, // list of receivers
          subject: " CRM Datasense Password Reset",
          text: "Login Credential",
          html: ``,
        };

        mailData["html"] = `
        <b>Hai ${userData.first_name} ${userData.last_name},</b>
        <h4>Click on the below link to reset your password!</h4>
        <br/>
        <h5>${c_redirect}/token?${encryptedToken}</h5>
        </br>
        <h5><b>Thank You, </b> <br />  CRM Datasense</h5>
      `;

        const result = emailSend(mailData)

        if(result){
          sendResponse["appStatusCode"] = 0;
          sendResponse["message"] = "Email Send Successfully";
          sendResponse["payloadJson"] = [];
          sendResponse["error"] = "";
        }else{
          sendResponse["appStatusCode"] = 4;
          sendResponse["message"] = "";
          sendResponse["payloadJson"] = [];
          sendResponse["error"] = err;
        }

        return NextResponse.json(sendResponse, { status: 200 });
   

       
      } else {
        sendResponse["appStatusCode"] = 4;
        sendResponse["message"] = "";
        sendResponse["payloadJson"] = [];
        sendResponse["error"] = "Email is not registered with us!";
      }

      
    });

    return NextResponse.json(sendResponse, { status: 200 });
    
  } catch (err) {
    sendResponse["appStatusCode"] = 4;
    sendResponse["message"] = "";
    sendResponse["payloadJson"] = [];
    sendResponse["error"] = "Something went wrong!";

    return NextResponse.json(sendResponse, { status: 400 });
  }
}

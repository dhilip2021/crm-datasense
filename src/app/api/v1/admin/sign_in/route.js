import { NextResponse } from "next/server";

import {urlEncoder} from "encryptdecrypt-everytime/src";
import bcrypt from "bcryptjs";

import { Organization } from "@/models/organizationModel";
import { UserPrivileges } from "@/models/userPrivilegesModel";
import { Consolelog } from "@/models/consoleModel";
import { User } from "@/models/userModel";
import { UserRole } from "@/models/userRoleModel";

import connectMongoDB from "@/libs/mongodb";
import { generateAccessToken, getDateTime } from "@/helper/helper";










let sendResponse = {
  appStatusCode: "",
  message: "",
  payloadJson: [],
  error: "",
};

export async function POST(request) {
  const { email, password } = await request.json();



  try {
     await connectMongoDB();
   

    if ((email) && password) {
      
      await User.findOne({
        email: email,
        n_status: 1,
        n_published: 1
      }).then(async (data) => {
      
        const listRes = await UserRole.findOne({ c_role_id: data.c_role_id.trim() });

       

        const orgData = await Organization.findOne({ organization_id: data.organization_id });


         

            

              await bcrypt.compare(password, data.password).then(async (response) => {

           

                if (response) {

                  const UserPrivilege = await UserPrivileges.findOne({c_role_id: data.c_role_id})

                 

                  const date_time = getDateTime();

                  const tokenVerify = generateAccessToken({
                    _id:data._id,
                    user_id:data.user_id,
                    email: data.email,
                    organization_id: data.organization_id,
                    password: password,
                    c_role_id: data.c_role_id,
                    date_time: date_time,
                    user_name: data.user_name,
                    
                  });

  
                  const today = new Date();
                  const nextTenDays = new Date(today.getTime());

                  nextTenDays.setDate(nextTenDays.getDate() + 10);
                  const sampleData = [tokenVerify];
                  const secretKey = process.env.NEXT_PUBLIC_ENCY_DECY_SECRET;

                  const encryptedResults = urlEncoder(
                    secretKey,
                    JSON.stringify(sampleData)
                  );

                  if (data.c_role_id) {
                    let dataResults = {
                      organization_id: data.organization_id,
                      organization_name: orgData?.organization_name,                      
                      c_version: orgData?.c_version,
                      endedAt: orgData?.endedAt,        
                      first_name: data.first_name,
                      last_name: data.last_name,
                      user_name: data.user_name,
                      c_about_user: data.c_about_user,
                      email: data.email,
                      c_role_id: data.c_role_id,
                      user_id: data.user_id,
                      role:listRes.c_role_name,
                      tokenAccess: encryptedResults,
                      tokenExpiry: nextTenDays,
                      privileges: UserPrivilege.c_role_privileges
                    };
  
                    const consolelogdata = new Consolelog({
                      user_id : data._id,
                      user_name : data.user_name,
                      email : data.email,
                      sign_in_time : date_time,
                      sign_out_time:"",
                      n_status: 1,
                    });
  
                    consolelogdata.save();
                    sendResponse["appStatusCode"] = 0;
                    sendResponse["message"] = `login successfully`;
                    sendResponse["error"] = "";
                    sendResponse["payloadJson"] = dataResults;
                  } else {
                    sendResponse["appStatusCode"] = 4;
                    sendResponse["message"] = "";
                    sendResponse["error"] = "Invalid role";
                    sendResponse["payloadJson"] = [];
                  }
                } else {
                  sendResponse["appStatusCode"] = 4;
                  sendResponse["message"] = "";
                  sendResponse["error"] = "Invalid credential";
                  sendResponse["payloadJson"] = [];
                }
              })
              .catch((err) => {
                sendResponse["appStatusCode"] = 4;
                sendResponse["message"] = "";
                sendResponse["payloadJson"] = [];
                sendResponse["error"] = "Invalid credential";
              });

          
        }).catch((err) => {
          sendResponse["appStatusCode"] = 4;
          sendResponse["message"] = "";
          sendResponse["payloadJson"] = err;
          sendResponse["error"] = "Please contact your administrator";
        });
    } else {
      sendResponse["appStatusCode"] = 4;
      sendResponse["message"] = "";
      sendResponse["error"] = "Invalid Payload!";
      sendResponse["payloadJson"] = [];
    }

    return NextResponse.json(sendResponse, { status: 200 });
  } catch (error) {
    sendResponse["appStatusCode"] = 4;
    sendResponse["message"] = "";
    sendResponse["payloadJson"] = [];
    sendResponse["error"] = "Something went wrong!";

    return NextResponse.json(sendResponse, { status: 400 });
  }
}

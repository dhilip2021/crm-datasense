import { NextResponse } from "next/server";

import { UserRole } from "@/models/userRoleModel";
import connectMongoDB from "@/libs/mongodb";
import { create_UUID } from "@/helper/clientHelper";



let sendResponse = {
  appStatusCode: "",
  message: "",
  payloadJson: [],
  error: "",
};

export async function POST(request) {
  const { c_role_name,c_description, Id, n_status } = await request.json();

  try {
    await connectMongoDB();

    if (Id) {
      const userRoleId = await UserRole.findOne({
        _id: Id,
      });

      if (userRoleId === null) {
        sendResponse["appStatusCode"] = 4;
        sendResponse["message"] = [];
        sendResponse["payloadJson"] = [];
        sendResponse["error"] = "Please enter valid id!";

        return NextResponse.json(sendResponse, { status: 200 });
      } else {
        const body = {
          c_role_name: c_role_name,
          c_description: c_description,
          n_status: n_status,
        };

        await UserRole.findByIdAndUpdate(Id, body)
          .then(() => {
            sendResponse["appStatusCode"] = 0;
            sendResponse["message"] = "Updated Successfully!";
            sendResponse["payloadJson"] = [];
            sendResponse["error"] = [];
          })
          .catch((err) => {
            sendResponse["appStatusCode"] = 4;
            sendResponse["message"] = "Invalid Id";
            sendResponse["payloadJson"] = [];
            sendResponse["error"] = err;
          });

        return NextResponse.json(sendResponse, { status: 200 });
      }
    } else {
      const userRoleName = await UserRole.findOne({
        c_role_name: c_role_name,
      });

      if (c_role_name === "") {
        sendResponse["appStatusCode"] = 4;
        sendResponse["message"] = [];
        sendResponse["payloadJson"] = [];
        sendResponse["error"] = "Please enter user role!";

        return NextResponse.json(sendResponse, { status: 200 });
      } else if (userRoleName) {
        sendResponse["appStatusCode"] = 4;
        sendResponse["message"] = [];
        sendResponse["payloadJson"] = [];
        sendResponse["error"] = " User role already exist";

        return NextResponse.json(sendResponse, { status: 200 });
      } else {

        const lastRole = await UserRole.findOne().sort({ c_role_priority: -1 });
console.log(lastRole.c_role_priority);


        let userrole = new UserRole({
          c_role_name,
          c_description,
          c_role_priority: lastRole.c_role_priority + 1,
          c_role_id: create_UUID(),
        });

        await userrole
          .save()
          .then(() => {
            sendResponse["appStatusCode"] = 0;
            sendResponse["message"] = "User role added Successfully!";
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
      }
    }
  } catch (err) {
    sendResponse["appStatusCode"] = 4;
    sendResponse["message"] = "";
    sendResponse["payloadJson"] = [];
    sendResponse["error"] = "Something went wrong!";

    return NextResponse.json(sendResponse, { status: 400 });
  }
}


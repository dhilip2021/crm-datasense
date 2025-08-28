import { NextResponse } from "next/server";
import { UserPrivileges } from "../../../../../../models/userPrivilegesModel";
import connectMongoDB from "../../../../../../libs/mongodb";
import {
  create_UUID,
  verifyAccessToken,
} from "../../../../../../helper/helper";

let sendResponse = {
  appStatusCode: "",
  message: "",
  payloadJson: [],
  error: "",
};

export async function POST(request) {
  const {
    c_role_id,
    c_role_privileges,
    c_menu_list,
    c_menu_privileges,
    Id,
    n_status,
  } = await request.json();

  try {
    await connectMongoDB();
    const verified = verifyAccessToken();

    

    if (verified.success) {
      if (Id) {
        const userPrivilegesId = await UserPrivileges.findOne({
          _id: Id,
        });

        if (userPrivilegesId === null) {
          sendResponse["appStatusCode"] = 4;
          sendResponse["message"] = [];
          sendResponse["payloadJson"] = [];
          sendResponse["error"] = "Please enter valid id!";
          return NextResponse.json(sendResponse, { status: 200 });
        } else {
          const body = {
           
            c_role_id: c_role_id,
            c_role_privileges: c_role_privileges,
            c_menu_list: c_menu_list,
            c_menu_privileges: c_menu_privileges,
            c_updatedBy: verified.data.user_id,
            n_status: n_status,
          };

          await UserPrivileges.findByIdAndUpdate(Id, body)
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
        const userPrivilegesId = await UserPrivileges.findOne({
          c_role_id: c_role_id,
        });

        if (c_role_id === "") {
          sendResponse["appStatusCode"] = 4;
          sendResponse["message"] = [];
          sendResponse["payloadJson"] = [];
          sendResponse["error"] = "Please select user!";
          return NextResponse.json(sendResponse, { status: 200 });
        } else if (userPrivilegesId) {
          sendResponse["appStatusCode"] = 4;
          sendResponse["message"] = [];
          sendResponse["payloadJson"] = [];
          sendResponse["error"] = " This User privilege already exist";
          return NextResponse.json(sendResponse, { status: 200 });
        } else {
        let userPrivilege = new UserPrivileges({
          c_privilege_id: create_UUID(),
          c_role_id,
          c_role_privileges,
          c_menu_list,
          c_menu_privileges,
          c_createdBy: verified.data.user_id,
        });

        

        await userPrivilege
          .save()
          .then(() => {
            sendResponse["appStatusCode"] = 0;
            sendResponse["message"] = "User privilege added Successfully!";
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
    } else {
      sendResponse["appStatusCode"] = 4;
      sendResponse["message"] = "";
      sendResponse["payloadJson"] = [];
      sendResponse["error"] = verified.error;
      return NextResponse.json(sendResponse, { status: 400 });
    }
  } catch (err) {
    sendResponse["appStatusCode"] = 4;
    sendResponse["message"] = "";
    sendResponse["payloadJson"] = [];
    sendResponse["error"] = "Something went wrong!";
    return NextResponse.json(sendResponse, { status: 400 });
  }
}

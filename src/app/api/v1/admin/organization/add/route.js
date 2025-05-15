import { NextResponse } from "next/server";


import { Organization } from "@/models/organizationModel";
import { create_UUID } from "@/helper/helper";
import connectMongoDB from "@/libs/mongodb";

let sendResponse = {
  appStatusCode: "",
  message: "",
  payloadJson: [],
  error: "",
};

export async function POST(request) {
  const { organization_name, Id, n_status, c_version } = await request.json();

  try {
    await connectMongoDB();

    if (Id) {
      const orgId = await Organization.findOne({
        _id: Id,
      });

      if (orgId === null) {
        sendResponse["appStatusCode"] = 4;
        sendResponse["message"] = [];
        sendResponse["payloadJson"] = [];
        sendResponse["error"] = "Please enter valid id!";

        return NextResponse.json(sendResponse, { status: 200 });
      } else {
        const body = {
          organization_name: organization_name,
          c_version: c_version,
          n_status: n_status,
        };

        await Organization.findByIdAndUpdate(Id, body)
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
      const orgName = await Organization.findOne({
        organization_name: organization_name,
      });

      if (organization_name === "") {
        sendResponse["appStatusCode"] = 4;
        sendResponse["message"] = [];
        sendResponse["payloadJson"] = [];
        sendResponse["error"] = "Please enter organization!";

        return NextResponse.json(sendResponse, { status: 200 });
      } else if (orgName) {
        sendResponse["appStatusCode"] = 4;
        sendResponse["message"] = [];
        sendResponse["payloadJson"] = [];
        sendResponse["error"] = "This organization already exist";
        
        return NextResponse.json(sendResponse, { status: 200 });
      } else {
        const now = new Date();
      const fourteenDaysLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);


        let orgData = new Organization({
          organization_name,
          c_version,
          organization_id: create_UUID(),
          endedAt: fourteenDaysLater,
        });

        await orgData.save()
          .then((data) => {
            sendResponse["appStatusCode"] = 0;
            sendResponse["message"] = "organization added Successfully!";
            sendResponse["payloadJson"] = data;
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


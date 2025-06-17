import { NextResponse } from "next/server";

import connectMongoDB from "@/libs/mongodb";
import { create_UUID, verifyAccessToken } from "@/helper/helper";
import { Field } from "@/models/fieldModel";


let sendResponse = {
  appStatusCode: "",
  message: "",
  payloadJson: [],
  error: "",
};

export async function POST(request) {
  const { organization_id, fields, Id } = await request.json();

  const verified = verifyAccessToken();

  if (verified.success) {
    try {
      await connectMongoDB();

      if (Id) {
        const FieldData = await Field.findOne({
          _id: Id,
        });

        if (FieldData === null) {
          sendResponse["appStatusCode"] = 4;
          sendResponse["message"] = [];
          sendResponse["payloadJson"] = [];
          sendResponse["error"] = "Please enter valid id!";

          return NextResponse.json(sendResponse, { status: 200 });
        } else {
          const dummyAddArray =
            fields.length > 0
              ? fields.map((data) => ({
                  item_id: data.item_id,
                  label: data.label,
                  slug_label: data.slug_label,
                  type: data.type,
                  mandatory: data.mandatory,
                  position: data.position,
                  items: data.items || [],
                }))
              : [{}];


              

          await Field.findByIdAndUpdate(
            FieldData._id, // ✅ just the ID
            {
              $set: {
                organization_id: organization_id,
                fields: fields?.length > 0 ?dummyAddArray : [],
                c_updatedBy: verified.data.user_id,
              },
            },
            { new: true } // ✅ to get the updated document in response
          )
            .then((data) => {
              sendResponse["appStatusCode"] = 0;
              sendResponse["message"] = "Field updated Successfully!";
              sendResponse["payloadJson"] = data;
              sendResponse["error"] = [];
            })
            .catch((error) => {
              sendResponse["appStatusCode"] = 4;
              sendResponse["message"] = "Field update failed!";
              sendResponse["payloadJson"] = [];
              sendResponse["error"] = error;
            });

          return NextResponse.json(sendResponse, { status: 200 });
        }
      } else {
        const FieldData = await Field.findOne({
          organization_id: organization_id,
        });

        if (organization_id === "") {
          sendResponse["appStatusCode"] = 4;
          sendResponse["message"] = [];
          sendResponse["payloadJson"] = [];
          sendResponse["error"] = "Please enter organization !";

          return NextResponse.json(sendResponse, { status: 200 });
        } else if (FieldData) {
          const dummyAddArray = [];

           // Step 1: Get the last known position from existing fields
  const existingFields = FieldData.fields || [];
  let maxPosition = existingFields.length > 0
    ? Math.max(...existingFields.map(f => f.position || 0))
    : 0;

          fields.map((data, index) => {
            dummyAddArray.push({
              item_id: data.item_id,
              label: data.label,
              slug_label: data.slug_label,
              type: data.type,
              mandatory: data.mandatory,
              items: data.items || [], // Make sure to include items if present
              position: maxPosition + index + 1, // Increment from last known
            });
          });
          await Field.findByIdAndUpdate(
            FieldData._id, // just the ID here
            {
              $push: { fields: { $each: dummyAddArray } }, // $each allows pushing multiple items
            },
            { new: true } // return the updated document
          )
            .then((data) => {
              sendResponse["appStatusCode"] = 0;
              sendResponse["message"] = "Fields added Successfully!";
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
        } else {
          const dummyAddArray = [];

          fields.map((data) => {
            dummyAddArray.push({
              item_id: data.item_id,
              label: data.label,
              position: data.position ? data.position : 1,
              slug_label: data.slug_label,
              type: data.type,
              mandatory: data.mandatory,
              items: data.items || [], // Make sure to include items if present
            });
          });

          let FieldDataSave = new Field({
            organization_id,
            field_id: create_UUID(),
            fields: dummyAddArray,
            c_createdBy: verified.data.user_id,
          });
          await FieldDataSave.save()
            .then(() => {
              sendResponse["appStatusCode"] = 0;
              sendResponse["message"] = "Fields added Successfully!";
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
  } else {
    sendResponse["appStatusCode"] = 4;
    sendResponse["message"] = "";
    sendResponse["payloadJson"] = [];
    sendResponse["error"] = "token expired!";
    
    return NextResponse.json(sendResponse, { status: 400 });
  }
}

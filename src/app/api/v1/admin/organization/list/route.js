import { NextResponse } from "next/server";

import { Organization } from "@/models/organizationModel";
import connectMongoDB from "@/libs/mongodb";
import { verifyAccessToken } from "@/helper/clientHelper";



let sendResponse = {
  appStatusCode: "",
  message: "",
  payloadJson: [],
  error: "",
};


export async function GET(request) {
  const id = request.nextUrl.searchParams.get("id");
  const name = request.nextUrl.searchParams.get("name");

   const verified = verifyAccessToken();
   if (verified.success) {
    
    if (id) {
    await connectMongoDB();

      const checkId = await Organization.findOne({ organization_id: id });

      if (checkId) {

        let _search = {};

        _search["$and"] = [
            {
              $and: [
                { n_status: 1 }, 
                { n_published: 1 }, 
                { organization_id: id },
              ],
            },
          ];

        try {
          
          await Organization.aggregate([
            { $match: _search },
            {
              $group: {
                _id: "$_id",
                organization_name: { $first: "$organization_name" },
                organization_id: { $first: "$organization_id" },
                c_version: { $first: "$c_version" },
                createdAt: { $first: "$createdAt" },
                n_status: { $first: "$n_status" },
                n_published: { $first: "$n_published" },
              },
            },
            {
              $project: {
                _id: 1,
                organization_name: 1,
                organization_id: 1,
                c_version: 1,
                createdAt: 1,
                n_status: 1,
                n_published: 1,
              },
            },
            {
              $sort: { createdAt: -1 },
            },
          ])
            .then((data) => {
              if (data.length > 0) {
                sendResponse["appStatusCode"] = 0;
                sendResponse["message"] = "";
                sendResponse["payloadJson"] = data[0];
                sendResponse["error"] = [];
              } else {
                sendResponse["appStatusCode"] = 0;
                sendResponse["message"] = "Record not found!";
                sendResponse["payloadJson"] = [];
                sendResponse["error"] = [];
              }
            })
            .catch((err) => {
              sendResponse["appStatusCode"] = 4;
              sendResponse["message"] = "";
              sendResponse["payloadJson"] = [];
              sendResponse["error"] = err;
            });

          return NextResponse.json(sendResponse, { status: 200 });
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
        sendResponse["error"] = "Invalid Id!";

        return NextResponse.json(sendResponse, { status: 400 });
      }
    }else if (name) {

        await connectMongoDB();

        const checkName = await Organization.findOne({ organization_name: name });

        if (checkName) {
          let _search = {};
  
          _search["$and"] = [
              {
                $and: [
                  { n_status: 1 }, 
                  { n_published: 1 }, 
                  { organization_name: name },
                ],
              },
            ];
  
          try {
            
  
            await Organization.aggregate([
              { $match: _search },
              {
                $group: {
                  _id: "$_id",
                  organization_name: { $first: "$organization_name" },
                  c_version: { $first: "$c_version" },
                  organization_id: { $first: "$organization_id" },
                  createdAt: { $first: "$createdAt" },
                  n_status: { $first: "$n_status" },
                  n_published: { $first: "$n_published" },
                },
              },
              {
                $project: {
                  _id: 1,
                  organization_name: 1,
                  c_version: 1,
                  organization_id: 1,
                  createdAt: 1,
                  n_status: 1,
                  n_published: 1,
                },
              },
              {
                $sort: { createdAt: -1 },
              },
            ])
              .then((data) => {
                if (data.length > 0) {
                  sendResponse["appStatusCode"] = 0;
                  sendResponse["message"] = "";
                  sendResponse["payloadJson"] = data;
                  sendResponse["error"] = [];
                } else {
                  sendResponse["appStatusCode"] = 0;
                  sendResponse["message"] = "Record not found!";
                  sendResponse["payloadJson"] = [];
                  sendResponse["error"] = [];
                }
              }).catch((err) => {
                sendResponse["appStatusCode"] = 4;
                sendResponse["message"] = "";
                sendResponse["payloadJson"] = [];
                sendResponse["error"] = err;
              });
  
            return NextResponse.json(sendResponse, { status: 200 });
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
          sendResponse["error"] = "Record not found!";

          return NextResponse.json(sendResponse, { status: 200 });
        }
      } else {
      let _search = {};
      
      _search["$and"] = [
        {
          $and: [{ n_status: 1 }, { n_published: 1 }],
        },
      ];

      try {
        await connectMongoDB();
        await Organization.aggregate([
          { $match: _search },
          {
            $group: {
              _id: "$_id",
              organization_name: { $first: "$organization_name" },
              organization_id: { $first: "$organization_id" },
              c_version: { $first: "$c_version" },
              createdAt: { $first: "$createdAt" },
              c_createdBy: { $first: "$c_createdBy" },
              n_status: { $first: "$n_status" },
              n_published: { $first: "$n_published" },
            },
          },
          {
            $project: {
              _id: 1,
              organization_name: 1,
              organization_id: 1,
              c_version: 1,
              createdAt: 1,
              c_createdBy: 1,
              n_status: 1,
              n_published: 1,
            },
          },
          {
            $sort: { createdAt: -1 },
          },
        ])
          .then((data) => {
            if (data.length > 0) {
              sendResponse["appStatusCode"] = 0;
              sendResponse["message"] = "";
              sendResponse["payloadJson"] = data;
              sendResponse["error"] = [];
            } else {
              sendResponse["appStatusCode"] = 0;
              sendResponse["message"] = "Record not found!";
              sendResponse["payloadJson"] = [];
              sendResponse["error"] = [];
            }
          })
          .catch((err) => {
            sendResponse["appStatusCode"] = 4;
            sendResponse["message"] = "";
            sendResponse["payloadJson"] = [];
            sendResponse["error"] = err;
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
   }else {
         sendResponse["appStatusCode"] = 4;
         sendResponse["message"] = "";
         sendResponse["payloadJson"] = [];
         sendResponse["error"] = verified.error;
   
         return NextResponse.json(sendResponse, { status: 400 });
       }

  

   
  
}


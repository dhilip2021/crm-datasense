import { NextResponse } from "next/server";


// eslint-disable-next-line import/named
import { verifyAccessToken } from "@/helper/helper";
import connectMongoDB from "@/libs/mongodb";
import { UserRole } from "@/models/userRoleModel";

let sendResponse = {
  appStatusCode: "",
  message: "",
  payloadJson: [],
  error: "",
};



export async function GET(request) {
  const id = request.nextUrl.searchParams.get("id");
  const verified = verifyAccessToken();

  console.log(verified,"<<< VERIFIED ")

  await connectMongoDB();

  const userRoleData = await UserRole.findOne({c_role_id : verified.data.c_role_id  });

  const RoleData = await UserRole.find({
    c_role_priority: { $gt: userRoleData.c_role_priority }
  })
  
  const checkArray = [];

  RoleData.map((data) =>{
    checkArray.push(data.c_role_id)
  })


  if (verified.success) {


    if (id) {
      const checkId = await UserRole.findOne({ c_role_id: id });

      if (checkId) {
        let _search = {};

        if(verified.data.c_role_id === "16f01165898b"){
          _search["$and"] = [
            {
              $and: [
                { n_status: 1 }, 
                { n_published: 1 }, 
                { c_role_id: id },
              ]
            }
          ];
        }else{
          _search["$and"] = [
            {
              $and: [
                { n_status: 1 }, 
                { n_published: 1 }, 
                { c_role_id: id },
                { c_role_id: { $nin: ["16f01165898b"] } }
              ],
            },
          ];
        }

        try {
          

          await UserRole.aggregate([
            { $match: _search },
            {
              $group: {
                _id: "$_id",
                c_role_name: { $first: "$c_role_name" },
                c_role_id: { $first: "$c_role_id" },
                createdAt: { $first: "$createdAt" },
                n_status: { $first: "$n_status" },
                n_published: { $first: "$n_published" },
              },
            },
            {
              $project: {
                _id: 1,
                c_role_name: 1,
                c_role_id: 1,
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
    } else {

      console.log(checkArray,"<<< checkArray")
      

      let _search = {};

      _search["$and"] = [
        {
          $and: [
            { n_status: 1 }, 
            { n_published: 1 },
            { c_role_id: {$in: checkArray}}
          ],
        },
      ];

      try {
        await connectMongoDB();
        await UserRole.aggregate([
          { $match: _search },
          {
            $group: {
              _id: "$_id",
              c_role_name: { $first: "$c_role_name" },
              c_role_id: { $first: "$c_role_id" },
              
              createdAt: { $first: "$createdAt" },
              c_createdBy: { $first: "$c_createdBy" },
              n_status: { $first: "$n_status" },
              n_published: { $first: "$n_published" },
            },
          },
          {
            $project: {
              _id: 1,
              c_role_name: 1,
              c_role_id: 1,
              
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



  }else{
    sendResponse["appStatusCode"] = 4;
    sendResponse["message"] = "";
    sendResponse["payloadJson"] = [];
    sendResponse["error"] = "token expired!";

    return NextResponse.json(sendResponse, { status: 400 });
  }

   
  
}


export async function POST() {
  sendResponse["appStatusCode"] = 0;
  sendResponse["message"] = "";
  sendResponse["payloadJson"] = [];
  sendResponse["error"] = "";

  return NextResponse.json(sendResponse, { status: 200 });

}


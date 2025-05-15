import { NextResponse } from "next/server";

import connectMongoDB from "@/libs/mongodb";
import { verifyAccessToken } from "@/helper/helper";
import { Field } from "@/models/fieldModel";


let sendResponse = {
  appStatusCode: "",
  message: "",
  payloadJson: [],
  error: "",
};




export async function POST(request){
  const { c_search_term } = await request.json();

  let searchTerm = c_search_term ? c_search_term : "";

  if(searchTerm !== ""){
    let _search = {};
    
    _search["$and"] = [
      {
        $and: [{ n_status: 1 }, { n_published: 1 },],
      },
    ];

    try {
      await connectMongoDB();

      await Field.aggregate([
        { $match: _search },
        {
          $group: {
            _id: "$_id",
            organization_id: { $first: "$organization_id" },
            field_id: { $first: "$field_id" },
            fields: { $first: "$fields" },
          },
        },
        
        {
          $project: {
            _id: 1,
            organization_id: 1,
            field_id: 1,
            fields: 1,
            createdAt: 1,
            c_createdBy: 1,
            n_status: 1,
            n_published: 1,
          },
        },
        {
          $sort: { createdAt: 1 },
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
  }else{
    let _search = {};

    _search["$and"] = [
      {
        $and: [{ n_status: 1 }, { n_published: 1 }],
      },
    ];

    try {
      await connectMongoDB();

      await Field.aggregate([
        { $match: _search },
        {
          $group: {
            _id: "$_id",
            organization_id: { $first: "$organization_id" },
            field_id: { $first: "$field_id" },
            fields: { $first: "$fields" },
            createdAt: { $first: "$createdAt" },
            c_createdBy: { $first: "$c_createdBy" },
            n_status: { $first: "$n_status" },
            n_published: { $first: "$n_published" },
          },
        },
        {
          $project: {
            _id: 1,
            organization_id: 1,
            field_id: 1,
            fields: 1,
            createdAt: 1,
            c_createdBy: 1,
            n_status: 1,
            n_published: 1,
          },
        },
        {
          $sort: { createdAt: 1 },
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

}


export async function GET(request) {
  const verified = verifyAccessToken();
  const id = request.nextUrl.searchParams.get("id");


  if (verified.success) {
    if (id) {
      const checkId = await Field.findOne({ organization_id: id });

      if (checkId) {
        let _search = {};

        _search["$and"] = [
          {
            $and: [{ n_status: 1 }, { n_published: 1 }, { organization_id: id }],
          },
        ];

        try {
          await connectMongoDB();

          await Field.aggregate([
            { $match: _search },
            {
              $group: {
                _id: "$_id",
                organization_id: { $first: "$organization_id" },
                field_id: { $first: "$field_id" },
                fields: { $first: "$fields" },
                createdAt: { $first: "$createdAt" },
                c_createdBy: { $first: "$c_createdBy" },
                n_status: { $first: "$n_status" },
                n_published: { $first: "$n_published" },
              },
            },
            {
              $project: {
                _id: 1,
                organization_id: 1,
                field_id: 1,
                fields: 1,
                createdAt: 1,
                c_createdBy: 1,
                n_status: 1,
                n_published: 1,
              },
            },
            {
              $sort: { createdAt: 1 },
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
      } else {
        sendResponse["appStatusCode"] = 4;
        sendResponse["message"] = "";
        sendResponse["payloadJson"] = [];
        sendResponse["error"] = "Record not found!";

        return NextResponse.json(sendResponse, { status: 400 });
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

        await Field.aggregate([
          { $match: _search },
          {
            $group: {
              _id: "$_id",
              organization_id: { $first: "$organization_id" },
              field_id: { $first: "$field_id" },
              fields: { $first: "$fields" },
              createdAt: { $first: "$createdAt" },
              c_createdBy: { $first: "$c_createdBy" },
              n_status: { $first: "$n_status" },
              n_published: { $first: "$n_published" },
            },
          },
          {
            $project: {
              _id: 1,
              organization_id: 1,
              field_id: 1,
              fields: 1,
              createdAt: 1,
              c_createdBy: 1,
              n_status: 1,
              n_published: 1,
            },
          },
          {
            $sort: { createdAt: 1 },
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
  } else {
    sendResponse["appStatusCode"] = 4;
    sendResponse["message"] = "";
    sendResponse["payloadJson"] = [];
    sendResponse["error"] = "token expired!";

    return NextResponse.json(sendResponse, { status: 400 });
  }
}

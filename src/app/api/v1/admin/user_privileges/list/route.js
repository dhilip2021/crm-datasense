import { NextResponse } from "next/server";
// import { verifyAccessToken } from "@/helper/helper";
import connectMongoDB from "@/libs/mongodb";
import { UserPrivileges } from "@/models/userPrivilegesModel";
import { verifyAccessToken } from "@/helper/clientHelper";

let sendResponse = {
  appStatusCode: "",
  message: "",
  payloadJson: [],
  error: "",
};

export async function POST(request) {
  const {
    n_page,
    n_limit,
    c_search_term,
  } = await request.json();


  const verified = verifyAccessToken();
  try {
    if (verified.success) {
      let _search = {};
      let n_limitTerm = n_limit;
      let n_pageTerm = n_page === 1 ? 0 : (n_page - 1) * n_limit;
      let searchTerm = c_search_term ? c_search_term : "";



      if (searchTerm !== "" ) {
       

        if(verified.data.c_role_id === "16f01165898b"){
          _search["$and"] = [
            {
              $and: [
               
                { c_privilege_name: { $regex: searchTerm, $options: "i" } },
                { n_status: 1 },
                { n_published: 1 },
              ],
            },
          ];
        }else{
          _search["$and"] = [
            {
              $and: [
               
                { c_privilege_name: { $regex: searchTerm, $options: "i" } },
                { n_status: 1 },
                { n_published: 1 },
                { c_role_id: { $nin: ["16f01165898b"] } },
              ],
            },
          ];
        }

       
      } else {
        if(verified.data.c_role_id === "16f01165898b"){
          _search["$and"] = [
            {
              $and: [
                { n_status: 1 },
                { n_published: 1 },
              ],
            },
          ];
        }else{
          _search["$and"] = [
            {
              $and: [
                { n_status: 1 },
                { n_published: 1 },
                { c_role_id: { $nin: ["16f01165898b"] } },
              ],
            },
          ];
        }
        
      }

      if (n_limitTerm !== "" && n_pageTerm !== "") {
        await connectMongoDB();

        await UserPrivileges.aggregate([
          {
            $match: _search,
          },
          {
            $group: {
              _id: "$_id",
              c_privilege_name: { $first: "$c_privilege_name" },
              c_privilege_id: { $first: "$c_privilege_id" },
              c_role_id: { $first: "$c_role_id" },
              c_role_privileges: { $first: "$c_role_privileges" },
              c_menu_list: { $first: "$c_menu_list" },
              c_menu_privileges: { $first: "$c_menu_privileges" },
              n_status: { $first: "$n_status" },
              n_published: { $first: "$n_published" },
              createdAt: { $first: "$createdAt" },
              c_createdBy: { $first: "$c_createdBy" },
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "c_createdBy",
              foreignField: "user_id",
              as: "createdById",
            },
          },
          {
            $unwind: {
              path: "$createdById",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              _id: 1,
              c_privilege_name: 1,
              c_privilege_id: 1,
              c_role_id: 1,
              c_role_privileges: 1,
              c_menu_list: 1,
              c_menu_privileges: 1,
              n_status: 1,
              n_published: 1,
              createdAt: 1,
              c_createdBy: 1,
              createdName: "$createdById.user_name",
            },
          },
          {
            $sort: { createdAt: -1 },
          },
          {
            $facet: {
              data: [{ $skip: n_pageTerm }, { $limit: n_limitTerm }],
              total_count: [
                {
                  $count: "count",
                },
              ],
            },
          },
        ])
          .then((data) => {
            if (data[0].data.length > 0) {
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
      } else {
        sendResponse["appStatusCode"] = 4;
        sendResponse["message"] = "";
        sendResponse["payloadJson"] = [];
        sendResponse["error"] = "Invalid Payload";
        return NextResponse.json(sendResponse, { status: 200 });
      }
    } else {
      sendResponse["appStatusCode"] = 4;
      sendResponse["message"] = [];
      sendResponse["payloadJson"] = [];
      sendResponse["error"] = verified.error;
      return NextResponse.json(sendResponse, { status: 200 });
    }
  } catch (error) {
    sendResponse["appStatusCode"] = 4;
    sendResponse["message"] = [];
    sendResponse["payloadJson"] = [];
    sendResponse["error"] = "Something went wrong!";
    return NextResponse.json(sendResponse, { status: 400 });
  }
}

export async function GET(request) {
  const verified = verifyAccessToken();

  const id = request.nextUrl.searchParams.get("id");

  if (verified.success) {
    if (id) {
      const checkId = await UserPrivileges.findOne({ c_privilege_id: id });
      if (checkId) {
        let _search = {};
        if(verified.data.c_role_id === "16f01165898b"){
          _search["$and"] = [
            {
              $and: [
                { n_status: 1 }, 
                { n_published: 1 }, 
                { c_privilege_id: id },
              ],
            },
          ];
        }else{
          _search["$and"] = [
            {
              $and: [
                { n_status: 1 }, 
                { n_published: 1 }, 
                { c_privilege_id: id },
                { c_role_id: { $nin: ["16f01165898b"] } },
              ],
            },
          ];
        }
        

        try {
          await connectMongoDB();

          await UserPrivileges.aggregate([
            { $match: _search },
            {
              $group: {
                _id: "$_id",
                
                c_privilege_id: { $first: "$c_privilege_id" },
                c_role_id: { $first: "$c_role_id" },
                c_role_privileges: { $first: "$c_role_privileges" },
                c_menu_list: { $first: "$c_menu_list" },
                c_menu_privileges: { $first: "$c_menu_privileges" },
                createdAt: { $first: "$createdAt" },
                updatedAt: { $first: "$updatedAt" },
                c_createdBy: { $first: "$c_createdBy" },
                n_status: { $first: "$n_status" },
                n_published: { $first: "$n_published" },
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "c_createdBy",
                foreignField: "user_id",
                as: "users",
              },
            },
            {
              $unwind: "$users",
            },
            {
              $lookup: {
                from: "userrole",
                localField: "c_role_id",
                foreignField: "c_role_id",
                as: "userrole",
              },
            },
            {
              $unwind: "$userrole",
            },
            {
              $project: {
                _id: 1,
                c_privilege_id: 1,
                c_role_id: 1,
                c_role_name:"$userrole.c_role_name",
                c_role_privileges: 1,
                c_menu_list: 1,
                c_menu_privileges: 1,
                createdAt: 1,
                updatedAt: 1,
                c_createdBy: 1,
                c_createdName: "$users.user_name",
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

      console.log(verified.data.c_role_id,"<<< IDDDDDDDD")


      let _search = {};
      if(verified.data.c_role_id === "16f01165898b"){
        _search["$and"] = [
          {
            $and: [{ n_status: 1 }, { n_published: 1 }],
          },
        ];
      }else{
        _search["$and"] = [
          {
            $and: [{ n_status: 1 }, { n_published: 1 },{ c_role_id: { $nin: ["16f01165898b"] } }],
          },
        ];
      }
     

      try {
        await connectMongoDB();

        await UserPrivileges.aggregate([
          { $match: _search },
          {
            $group: {
              _id: "$_id",
              c_privilege_id: { $first: "$c_privilege_id" },
              c_role_id: { $first: "$c_role_id" },
              c_role_privileges: { $first: "$c_role_privileges" },
              c_menu_list: { $first: "$c_menu_list" },
              c_menu_privileges: { $first: "$c_menu_privileges" },
              createdAt: { $first: "$createdAt" },
              updatedAt: { $first: "$updatedAt" },
              c_createdBy: { $first: "$c_createdBy" },
              n_status: { $first: "$n_status" },
              n_published: { $first: "$n_published" },
            },
          },
          // {
          //   $lookup: {
          //     from: "users",
          //     localField: "c_createdBy",
          //     foreignField: "user_id",
          //     as: "users",
          //   },
          // },
          // {
          //   $unwind: "$users",
          // },
          // {
          //   $lookup: {
          //     from: "userrole",
          //     localField: "c_role_id",
          //     foreignField: "c_role_id",
          //     as: "userrole",
          //   },
          // },
          // {
          //   $unwind: "$userrole",
          // },
          {
            $project: {
              _id: 1,
              c_privilege_id: 1,
              c_role_id: 1,
              // c_role_name:"$userrole.c_role_name",
              c_role_privileges: 1,
              c_menu_list: 1,
              c_menu_privileges: 1,
              createdAt: 1,
              updatedAt: 1,
              c_createdBy: 1,
              // c_createdName: "$users.user_name",
              n_status: 1,
              n_published: 1,
            },
          },
          {
            $sort: { createdAt: -1 },
          },
        ])
          .then((data) => {

            console.log(data,"<<< UP DATA")
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

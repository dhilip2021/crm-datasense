import { NextResponse } from "next/server";

import connectMongoDB from "@/libs/mongodb";
import { verifyAccessToken } from "@/helper/clientHelper";
import { Lead } from "@/models/leadModel";


let sendResponse = {
  appStatusCode: "",
  message: "",
  payloadJson: [],
  error: "",
};

export async function GET(request) {
  const verified = verifyAccessToken();
  const id = request.nextUrl.searchParams.get("id");
  const name = request.nextUrl.searchParams.get("name");
  const tagId = request.nextUrl.searchParams.get("tagId");
  const orgId = request.nextUrl.searchParams.get("orgId");

 

  if (verified.success) {
    if (id) {
      const checkId = await Lead.findOne({ lead_id: id });

      if (checkId) {
        let _search = {};

        _search["$and"] = [
          {
            $and: [{ n_status: 1 }, { n_published: 1 }, { lead_id: id },{live_status: "lead"}],
          },
        ];

        try {
          await connectMongoDB();
          await Lead.aggregate([
            { $match: _search },
            {
              $group: {
                _id: "$_id",

                organization_id: { $first: "$organization_id" },
                salutation: { $first: "$salutation" },                
                lead_name: { $first: "$lead_name" },
                lead_id: { $first: "$lead_id" },
                lead_slug_name: { $first: "$lead_slug_name" },
                first_name: { $first: "$first_name" },
                last_name: { $first: "$last_name" },
                email: { $first: "$email" },
                mobile: { $first: "$mobile" },
                phone: { $first: "$phone" },
                gender: { $first: "$gender" },
                organization: { $first: "$organization" },
                website: { $first: "$website" },
                no_of_employees: { $first: "$no_of_employees" },
                annual_revenue: { $first: "$annual_revenue" },
                industry: { $first: "$industry" },
                job_title: { $first: "$job_title" },
                lead_source: { $first: "$lead_source" },
                status: { $first: "$status" },
                live_status: { $first: "$live_status" },
                c_activities: { $first: "$c_activities" },
                c_emails: { $first: "$c_emails" },
                c_comments: { $first: "$c_comments" },
                c_calls: { $first: "$c_calls" },
                c_tasks: { $first: "$c_tasks" },
                c_notes: { $first: "$c_notes" },
                others: { $first: "$others" },
                c_attachments: { $first: "$c_attachments" },
                createdAt: { $first: "$createdAt" },
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
              $project: {
                _id: 1,
                organization_id: 1,
                salutation: 1,
                lead_name: 1,
                lead_id: 1,
                lead_slug_name: 1,
                first_name: 1,
                last_name: 1,
                email: 1,
                mobile: 1,
                phone: 1,
                gender: 1,
                organization: 1,
                website: 1,
                no_of_employees: 1,
                annual_revenue: 1,
                industry: 1,
                job_title: 1,
                lead_source: 1,
                status: 1,
                live_status: 1,
                c_activities: 1,
                c_emails: 1,
                c_comments: 1,
                c_calls: 1,
                c_tasks: 1,
                c_notes: 1,
                others: 1,
                c_attachments: 1,
                createdAt: 1,
                c_createdBy: 1,
                c_createdName: "$users.user_name",
                n_status: 1,
                n_published: 1,
              },
            },
            {
              $sort: { createdAt: 1 },
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
        sendResponse["error"] = "Invalid Id!";

        return NextResponse.json(sendResponse, { status: 400 });
      }
    } 
    
    if(name && orgId){
      const checkName = await Lead.findOne({ lead_slug_name: name, organization_id: orgId });

      if (checkName) {
        
        let _search = {};
         
          _search["$and"] = [
            {
              $and: [
                { n_status: 1 }, 
                { n_published: 1 }, 
                { lead_slug_name: name },
                { organization_id: orgId },
                {live_status: "lead"}
              ],
            },
          ];
        
       



        try {
          await connectMongoDB();

          await Lead.aggregate([
            { $match: _search },
            {
              $group: {
                _id: "$_id",
                organization_id: { $first: "$organization_id" },
                salutation: { $first: "$salutation" },                
                lead_name: { $first: "$lead_name" },
                lead_id: { $first: "$lead_id" },
                lead_slug_name: { $first: "$lead_slug_name" },
                first_name: { $first: "$first_name" },
                last_name: { $first: "$last_name" },
                email: { $first: "$email" },
                mobile: { $first: "$mobile" },
                phone: { $first: "$phone" },
                gender: { $first: "$gender" },
                organization: { $first: "$organization" },
                website: { $first: "$website" },
                no_of_employees: { $first: "$no_of_employees" },
                annual_revenue: { $first: "$annual_revenue" },
                industry: { $first: "$industry" },
                job_title: { $first: "$job_title" },
                lead_source: { $first: "$lead_source" },
                status: { $first: "$status" },
                live_status: { $first: "$live_status" },
                c_activities: { $first: "$c_activities" },
                c_emails: { $first: "$c_emails" },
                c_comments: { $first: "$c_comments" },
                c_calls: { $first: "$c_calls" },
                c_tasks: { $first: "$c_tasks" },
                c_notes: { $first: "$c_notes" },
                others: { $first: "$others" },                
                c_attachments: { $first: "$c_attachments" },
                createdAt: { $first: "$createdAt" },
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
              $project: {
                _id: 1,
                organization_id: 1,
                salutation: 1,
                lead_name: 1,
                lead_id: 1,
                lead_slug_name: 1,
                first_name: 1,
                last_name: 1,
                email: 1,
                mobile: 1,
                phone: 1,
                gender: 1,
                organization: 1,
                website: 1,
                no_of_employees: 1,
                annual_revenue: 1,
                industry: 1,
                job_title: 1,
                lead_source: 1,
                status: 1,
                live_status: 1,
                c_activities: 1,
                c_emails: 1,
                c_comments: 1,
                c_calls: 1,
                c_tasks: 1,
                c_notes: 1,
                others: 1,
                c_attachments: 1,
                createdAt: 1,
                c_createdBy: 1,
                c_createdName: "$users.user_name",
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
        sendResponse["error"] = "Invalid Id!";

        return NextResponse.json(sendResponse, { status: 400 });
      }
    }

    if (name) {
      const checkName = await Lead.findOne({ lead_slug_name: name });

      if (checkName) {
        
        let _search = {};
         
          _search["$and"] = [
            {
              $and: [
                { n_status: 1 }, 
                { n_published: 1 }, 
                { lead_slug_name: name },
                {live_status: "lead"}
              ],
            },
          ];
        
       



        try {
          await connectMongoDB();

          await Lead.aggregate([
            { $match: _search },
            {
              $group: {
                _id: "$_id",
                organization_id: { $first: "$organization_id" },
                salutation: { $first: "$salutation" },                
                lead_name: { $first: "$lead_name" },
                lead_id: { $first: "$lead_id" },
                lead_slug_name: { $first: "$lead_slug_name" },
                first_name: { $first: "$first_name" },
                last_name: { $first: "$last_name" },
                email: { $first: "$email" },
                mobile: { $first: "$mobile" },
                phone: { $first: "$phone" },
                gender: { $first: "$gender" },
                organization: { $first: "$organization" },
                website: { $first: "$website" },
                no_of_employees: { $first: "$no_of_employees" },
                annual_revenue: { $first: "$annual_revenue" },
                industry: { $first: "$industry" },
                job_title: { $first: "$job_title" },
                lead_source: { $first: "$lead_source" },
                status: { $first: "$status" },
                live_status: { $first: "$live_status" },
                c_activities: { $first: "$c_activities" },
                c_emails: { $first: "$c_emails" },
                c_comments: { $first: "$c_comments" },
                c_calls: { $first: "$c_calls" },
                c_tasks: { $first: "$c_tasks" },
                c_notes: { $first: "$c_notes" },
                others: { $first: "$others" },                
                c_attachments: { $first: "$c_attachments" },
                createdAt: { $first: "$createdAt" },
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
              $project: {
                _id: 1,
                organization_id: 1,
                salutation: 1,
                lead_name: 1,
                lead_id: 1,
                lead_slug_name: 1,
                first_name: 1,
                last_name: 1,
                email: 1,
                mobile: 1,
                phone: 1,
                gender: 1,
                organization: 1,
                website: 1,
                no_of_employees: 1,
                annual_revenue: 1,
                industry: 1,
                job_title: 1,
                lead_source: 1,
                status: 1,
                live_status: 1,
                c_activities: 1,
                c_emails: 1,
                c_comments: 1,
                c_calls: 1,
                c_tasks: 1,
                c_notes: 1,
                others: 1,
                c_attachments: 1,
                createdAt: 1,
                c_createdBy: 1,
                c_createdName: "$users.user_name",
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
        sendResponse["error"] = "Invalid Id!";

        return NextResponse.json(sendResponse, { status: 400 });
      }
    }
    
    if (orgId) {
      const checkName = await Lead.findOne({ organization_id: orgId });

      if (checkName) {
        
        let _search = {};
         
          _search["$and"] = [
            {
              $and: [
                { n_status: 1 }, 
                { n_published: 1 }, 
                { organization_id: orgId },
                {live_status: "lead"}
              ],
            },
          ];
        
       



        try {
          await connectMongoDB();

          await Lead.aggregate([
            { $match: _search },
            {
              $group: {
                _id: "$_id",
                organization_id: { $first: "$organization_id" },
                salutation: { $first: "$salutation" },                
                lead_name: { $first: "$lead_name" },
                lead_id: { $first: "$lead_id" },
                lead_slug_name: { $first: "$lead_slug_name" },
                first_name: { $first: "$first_name" },
                last_name: { $first: "$last_name" },
                email: { $first: "$email" },
                mobile: { $first: "$mobile" },
                phone: { $first: "$phone" },
                gender: { $first: "$gender" },
                organization: { $first: "$organization" },
                website: { $first: "$website" },
                no_of_employees: { $first: "$no_of_employees" },
                annual_revenue: { $first: "$annual_revenue" },
                industry: { $first: "$industry" },
                job_title: { $first: "$job_title" },
                lead_source: { $first: "$lead_source" },
                status: { $first: "$status" },
                live_status: { $first: "$live_status" },
                c_activities: { $first: "$c_activities" },
                c_emails: { $first: "$c_emails" },
                c_comments: { $first: "$c_comments" },
                c_calls: { $first: "$c_calls" },
                c_tasks: { $first: "$c_tasks" },
                c_notes: { $first: "$c_notes" },
                others: { $first: "$others" },                
                c_attachments: { $first: "$c_attachments" },
                createdAt: { $first: "$createdAt" },
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
              $project: {
                _id: 1,
                organization_id: 1,
                salutation: 1,
                lead_name: 1,
                lead_id: 1,
                lead_slug_name: 1,
                first_name: 1,
                last_name: 1,
                email: 1,
                mobile: 1,
                phone: 1,
                gender: 1,
                organization: 1,
                website: 1,
                no_of_employees: 1,
                annual_revenue: 1,
                industry: 1,
                job_title: 1,
                lead_source: 1,
                status: 1,
                live_status: 1,
                c_activities: 1,
                c_emails: 1,
                c_comments: 1,
                c_calls: 1,
                c_tasks: 1,
                c_notes: 1,
                others: 1,
                c_attachments: 1,
                createdAt: 1,
                c_createdBy: 1,
                c_createdName: "$users.user_name",
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
        sendResponse["error"] = "Invalid Id!";

        return NextResponse.json(sendResponse, { status: 400 });
      }
    }
    else {
      let _search = {};

      _search["$and"] = [
        {
          $and: [{ n_status: 1 }, { n_published: 1 }, {live_status: "lead"}],
        },
      ];

      try {
        await connectMongoDB();

        await Lead.aggregate([
          { $match: _search },
          {
            $group: {
              _id: "$_id",

              organization_id: { $first: "$organization_id" },
              salutation: { $first: "$salutation" },
              lead_name: { $first: "$lead_name" },
              lead_id: { $first: "$lead_id" },
              lead_slug_name: { $first: "$lead_slug_name" },
              first_name: { $first: "$first_name" },
              last_name: { $first: "$last_name" },
              email: { $first: "$email" },
              mobile: { $first: "$mobile" },
              phone: { $first: "$phone" },
              gender: { $first: "$gender" },
              organization: { $first: "$organization" },
              website: { $first: "$website" },
              no_of_employees: { $first: "$no_of_employees" },
              annual_revenue: { $first: "$annual_revenue" },
              industry: { $first: "$industry" },
              job_title: { $first: "$job_title" },
              lead_source: { $first: "$lead_source" },
              status: { $first: "$status" },
              live_status: { $first: "$live_status" },
              c_activities: { $first: "$c_activities" },
              c_emails: { $first: "$c_emails" },
              c_comments: { $first: "$c_comments" },
              c_calls: { $first: "$c_calls" },
              c_tasks: { $first: "$c_tasks" },
              c_notes: { $first: "$c_notes" },
              others: { $first: "$others" },              
              c_attachments: { $first: "$c_attachments" },
              createdAt: { $first: "$createdAt" },
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
            $project: {
              _id: 1,
              organization_id: 1,
              salutation: 1,
              lead_name: 1,
              lead_id: 1,
              lead_slug_name: 1,
              first_name: 1,
              last_name: 1,
              email: 1,
              mobile: 1,
              phone: 1,
              gender: 1,
              organization: 1,
              website: 1,
              no_of_employees: 1,
              annual_revenue: 1,
              industry: 1,
              job_title: 1,
              lead_source: 1,
              status: 1,
              live_status: 1,
              c_activities: 1,
              c_emails: 1,
              c_comments: 1,
              c_calls: 1,
              c_tasks: 1,
              c_notes: 1,
              others: 1,
              c_attachments: 1,
              createdAt: 1,
              c_createdBy: 1,
              c_createdName: "$users.user_name",
              n_status: 1,
              n_published: 1,
            },
          },
          {
            $sort: { createdAt: 1 },
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

export async function POST(request) {




  const {n_limit,n_page, c_search_term, organization_id } = await request.json();

  await connectMongoDB();


  const verified = verifyAccessToken();

  let searchTerm = c_search_term ? c_search_term : "";
  let n_limitTerm = n_limit;
  let n_pageTerm = n_page === 1 ? 0 : (n_page - 1) * n_limit;


  if(verified.success){
    if (searchTerm !== "") {
      let _search = {};
  
      if(verified.data.c_role_id === "16f01165898b"){
        _search["$and"] = [
          {
            $and: [
              { n_status: 1 },
              { n_published: 1 },
              { organization_id: organization_id },
              { live_status: "lead"},
              
            ],
            $or: [
              { lead_name: { $regex: searchTerm, $options: "i" } },
              { first_name: { $regex: searchTerm, $options: "i" } },
              { last_name: { $regex: searchTerm, $options: "i" } },
              { email: { $regex: searchTerm, $options: "i" } },
              { mobile: { $regex: searchTerm, $options: "i" } },
              { phone: { $regex: searchTerm, $options: "i" } },
              { organization: { $regex: searchTerm, $options: "i" } },
              
            ]
          },
        ];
      }else{
        _search["$and"] = [
          {
            $and: [
              { n_status: 1 },
              { n_published: 1 },
              { organization_id: organization_id },
              { live_status: "lead"},
              { c_createdBy: verified.data.user_id}
              
            ],
            $or: [
              { lead_name: { $regex: searchTerm, $options: "i" } },
              { first_name: { $regex: searchTerm, $options: "i" } },
              { last_name: { $regex: searchTerm, $options: "i" } },
              { email: { $regex: searchTerm, $options: "i" } },
              { mobile: { $regex: searchTerm, $options: "i" } },
              { phone: { $regex: searchTerm, $options: "i" } },
              { organization: { $regex: searchTerm, $options: "i" } },
              
            ]
          },
        ];
      }
  
      
  
      try {
        
  
        await Lead.aggregate([
          { $match: _search },
          {
            $group: {
              _id: "$_id",
              organization_id: { $first: "$organization_id" },
              salutation: { $first: "$salutation" },            
              lead_name: { $first: "$lead_name" },
              lead_id: { $first: "$lead_id" },
              lead_slug_name: { $first: "$lead_slug_name" },
              first_name: { $first: "$first_name" },
              last_name: { $first: "$last_name" },
              email: { $first: "$email" },
              mobile: { $first: "$mobile" },
              phone: { $first: "$phone" },
              gender: { $first: "$gender" },
              organization: { $first: "$organization" },
              website: { $first: "$website" },
              no_of_employees: { $first: "$no_of_employees" },
              annual_revenue: { $first: "$annual_revenue" },
              industry: { $first: "$industry" },
              job_title: { $first: "$job_title" },
              lead_source: { $first: "$lead_source" },
              status: { $first: "$status" },
              live_status: { $first: "$live_status" },
              c_activities: { $first: "$c_activities" },
              c_emails: { $first: "$c_emails" },
              c_comments: { $first: "$c_comments" },
              c_calls: { $first: "$c_calls" },
              c_tasks: { $first: "$c_tasks" },
              c_notes: { $first: "$c_notes" },
              others: { $first: "$others" },              
              c_attachments: { $first: "$c_attachments" },  
              createdAt: { $first: "$createdAt" },
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
            $project: {
              _id: 1,
              organization_id: 1,
              salutation: 1,
              lead_name: 1,
              lead_id: 1,
              lead_slug_name: 1,
              first_name: 1,
              last_name: 1,
              email: 1,
              mobile: 1,
              phone: 1,
              gender: 1,
              organization: 1,
              website: 1,
              no_of_employees: 1,
              annual_revenue: 1,
              industry: 1,
              job_title: 1,
              lead_source: 1,
              status: 1,
              live_status: 1,
              c_activities: 1,
              c_emails: 1,
              c_comments: 1,
              c_calls: 1,
              c_tasks: 1,
              c_notes: 1,
              others: 1,
              c_attachments: 1,
              createdAt: 1,
              c_createdBy: 1,
              c_createdName: "$users.user_name",
              n_status: 1,
              n_published: 1,
            },
          },
          {
            $sort: { createdAt: 1 },
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
      let _search = {};

      if(verified.data.c_role_id === "16f01165898b"){
        
        _search["$and"] = [
          {
            $and: [
              { n_status: 1 },
              { n_published: 1 },
              { organization_id: organization_id },
              { live_status: "lead"},
            ],
          },
        ];
      }else{
        _search["$and"] = [
          {
            $and: [
              { n_status: 1 },
              { n_published: 1 },
              { organization_id: organization_id },
              { live_status: "lead"},
              { c_createdBy:  verified.data.user_id}
            ],
          },
        ];
      }


  
      
  
      try {
        await connectMongoDB();
  
        await Lead.aggregate([
          { $match: _search },
          {
            $group: {
              _id: "$_id",
  
              organization_id: { $first: "$organization_id" },
              salutation: { $first: "$salutation" },
              lead_name: { $first: "$lead_name" },
              lead_id: { $first: "$lead_id" },
              lead_slug_name: { $first: "$lead_slug_name" },
              first_name: { $first: "$first_name" },
              last_name: { $first: "$last_name" },
              email: { $first: "$email" },
              mobile: { $first: "$mobile" },
              phone: { $first: "$phone" },            
              gender: { $first: "$gender" },
              organization: { $first: "$organization" },
              website: { $first: "$website" },
              no_of_employees: { $first: "$no_of_employees" },
              annual_revenue: { $first: "$annual_revenue" },
              industry: { $first: "$industry" },
              job_title: { $first: "$job_title" },
              lead_source: { $first: "$lead_source" },
              status: { $first: "$status" },
              live_status: { $first: "$live_status" },
              c_activities: { $first: "$c_activities" },
              c_emails: { $first: "$c_emails" },
              c_comments: { $first: "$c_comments" },
              c_calls: { $first: "$c_calls" },
              c_tasks: { $first: "$c_tasks" },
              c_notes: { $first: "$c_notes" },
              others: { $first: "$others" },              
              c_attachments: { $first: "$c_attachments" },
              createdAt: { $first: "$createdAt" },
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
            $project: {
              _id: 1,
              organization_id: 1,
              salutation: 1,
              lead_name: 1,
              lead_id: 1,
              lead_slug_name: 1,
              first_name: 1,
              last_name: 1,
              email: 1,
              mobile: 1,
              phone: 1,
              gender: 1,
              organization: 1,
              website: 1,
              no_of_employees: 1,
              annual_revenue: 1,
              industry: 1,
              job_title: 1,
              lead_source: 1,
              status: 1,
              live_status: 1,
              c_activities: 1,
              c_emails: 1,
              c_comments: 1,
              c_calls: 1,
              c_tasks: 1,
              c_notes: 1,
              others: 1,
              c_attachments: 1,
              createdAt: 1,
              c_createdBy: 1,
              c_createdName: "$users.user_name",
              n_status: 1,
              n_published: 1,
            },
          },
          {
            $sort: { createdAt: 1 },
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



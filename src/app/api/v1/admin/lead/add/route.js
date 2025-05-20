import { NextResponse } from "next/server";

import slugify from "slugify";

import connectMongoDB from "@/libs/mongodb";
import { create_UUID, verifyAccessToken } from "@/helper/helper";
import { Lead } from "@/models/leadModel";





let sendResponse = {
  appStatusCode: "",
  message: "",
  payloadJson: [],
  error: "",
};


function secondString(message){
  const secondWord = message.split(" ")[1];

  return secondWord
}

export async function POST(request) {
  const {
    organization_id,
    salutation,
    lead_name,
    lead_slug_name,
    first_name,
    last_name,
    email,
    mobile,
    phone,
    gender,
    organization,
    website,
    no_of_employees,
    annual_revenue,
    industry,
    job_title,
    lead_source,
    status,
    live_status,
    c_activities,
    c_emails,
    c_comments,
    c_calls,
    c_tasks,
    c_notes,
    c_attachments,
    Id,
    n_status,
  } = await request.json();

  try {
    await connectMongoDB();
    const verified = verifyAccessToken();
    const checkLeads = await Lead.findOne({ lead_name: lead_name });


    if (verified.success) {
      if (Id !== undefined) {
        const LeadId = await Lead.findOne({ _id: Id });

        if (LeadId === null) {
          sendResponse["appStatusCode"] = 4;
          sendResponse["message"] = [];
          sendResponse["payloadJson"] = [];
          sendResponse["error"] = "Please enter valid id!";

          return NextResponse.json(sendResponse, { status: 200 });
        } else {

          if(live_status){
            const update = {
              $set: {
                live_status,
                lead_name,
                lead_slug_name,
              },
              $push: {
                c_activities: {
                  c_activity: `${verified.data.user_name} ${c_activities}`,
                },
              },
            };

            await Lead.findByIdAndUpdate(Id, update, { runValidators: true, new: true }).then((result) => {
                sendResponse["appStatusCode"] = 0;
                sendResponse["message"] = "Lead Updated Successfully!";
                sendResponse["payloadJson"] = result;
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

          if(c_notes && secondString(c_activities) === "created"){

            const update = {
              $push: {
                c_notes: {
                  title: c_notes?.title,
                  comment: c_notes?.comment,
                },
                c_activities: {
                  c_activity: `${verified.data.user_name} ${c_activities}`,
                },
              },
            };

            await Lead.findByIdAndUpdate(Id, update, { runValidators: true, new: true }).then((result) => {
                sendResponse["appStatusCode"] = 0;
                sendResponse["message"] = "Lead Notes added Successfully!";
                sendResponse["payloadJson"] = result;
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
          
          if(c_notes && secondString(c_activities) === "deleted"){
            const update = {
              $set: {
                "c_notes.$[elem].title": c_notes?.title,
                "c_notes.$[elem].comment": c_notes?.comment,
                "c_notes.$[elem].status": c_notes.status,
              },
              $push: {
                c_activities: {
                  c_activity: `${verified.data.user_name} ${c_activities}`,
                },
              },
            };

            const options = {
              arrayFilters: [{ "elem._id": c_notes._id }],
              new: true,
            }; 

            await Lead.findByIdAndUpdate(Id, update, options).then((result) => {
                sendResponse["appStatusCode"] = 0;
                sendResponse["message"] = "Lead Notes deleted Successfully!";
                sendResponse["payloadJson"] = result;
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
          
          if(c_notes && secondString(c_activities) === "updated"){
            const update = {
              $set: {
                "c_notes.$[elem].title": c_notes?.title,
                "c_notes.$[elem].comment": c_notes?.comment,
                "c_notes.$[elem].status": c_notes.status,
              },
              $push: {
                c_activities: {
                  c_activity: `${verified.data.user_name} ${c_activities}`,
                },
              },
            };

            const options = {
              arrayFilters: [{ "elem._id": c_notes._id }],
              new: true,
            }; 

            await Lead.findByIdAndUpdate(Id, update, options).then((result) => {
                sendResponse["appStatusCode"] = 0;
                sendResponse["message"] = "Lead Notes updated Successfully!";
                sendResponse["payloadJson"] = result;
                sendResponse["error"] = [];
              })
              .catch((err) => {
                sendResponse["appStatusCode"] = 4;
                sendResponse["message"] = "Invalid Id";
                sendResponse["payloadJson"] = [];
                sendResponse["error"] = err;
              });

            return NextResponse.json(sendResponse, { status: 200 });
          }else{
            
            console.log("call 2")

            const update = {
              $set: {
                  annual_revenue,
                  email,
                  first_name,
                  gender,
                  industry,
                  job_title,
                  last_name,
                  lead_source,
                  live_status,
                  mobile,
                  no_of_employees,
                  organization,
                  organization_id,
                  phone,
                  salutation,
                  status,
                  website,
              },
              $push: {
                c_activities: {
                  c_activity: `${verified.data.user_name} ${c_activities}`,
                },
              },
            };

            await Lead.findByIdAndUpdate(Id, update, { runValidators: true, new: true }).then((result) => {
                sendResponse["appStatusCode"] = 0;
                sendResponse["message"] = "Lead Updated Successfully!";
                sendResponse["payloadJson"] = result;
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
          
        }
      } else {
        if (lead_name === "") {
          sendResponse["appStatusCode"] = 4;
          sendResponse["message"] = "";
          sendResponse["payloadJson"] = [];
          sendResponse["error"] = "Lead name is required";

          return NextResponse.json(sendResponse, { status: 200 });
        }

        if (first_name === "") {
          sendResponse["appStatusCode"] = 4;
          sendResponse["message"] = "";
          sendResponse["payloadJson"] = [];
          sendResponse["error"] = "First Name is required";

          return NextResponse.json(sendResponse, { status: 200 });
        } else if (checkLeads !== null) {
          sendResponse["appStatusCode"] = 4;
          sendResponse["message"] = [];
          sendResponse["payloadJson"] = [];
          sendResponse["error"] = "Lead already exist";

          return NextResponse.json(sendResponse, { status: 200 });
        } else if (checkLeads === null) {
          const result = await Lead.find().sort({ _id: -1 }).limit(1);

          console.log(result,"<<< results finddddd")

          

          const lastLeadName = result[0]?.auto_inc_id || "";
          const prefix = `${process.env.NEXT_PUBLIC_LEAD_PREFIX}`;
          const currentNum = parseInt(lastLeadName.replace(prefix, "")) || 0;
          const nextNum = String(currentNum + 1).padStart(5, "0"); // ensures 00004 format
          const nextLeadName = `${prefix} ${nextNum}`;

          const numStr = lastLeadName.replace(prefix, "").replace(/\D/g, "");  
          const currentNumber = parseInt(numStr, 10) || 0;   
          const nextNumAutoInc    = String(currentNumber + 1).padStart(5, "0");
          const nextLeadName1 = `${prefix} ${nextNumAutoInc}`;



          const slugLeadString = nextLeadName1.replace(/[^\w\s]|_/g, "");

          const slug_lead_name = slugify(slugLeadString, {
            replacement: "-",
            remove: undefined,
            lower: true,
            strict: false,
            locale: "vi",
            trim: true,
          });

          const dataActivity ={
            c_activity: `${verified.data.user_name} created this lead`
          }

          const body = {
            organization_id,
            lead_id: create_UUID(),
            salutation,
            auto_inc_id: nextNumAutoInc,
            lead_name: nextLeadName1,
            lead_slug_name: slug_lead_name,
            first_name,
            last_name,
            email,
            mobile,
            phone,
            gender,
            organization,
            website,
            no_of_employees,
            annual_revenue,
            industry,
            job_title,
            lead_source,
            status,
            live_status,
            c_createdBy: verified.data.user_id,
            c_activities : dataActivity
          };
        

          const LeadData = new Lead(body);
          
          await LeadData.save()
            .then((result) => {
              sendResponse["appStatusCode"] = 0;
              sendResponse["message"] = "Lead added Successfully";
              sendResponse["payloadJson"] = result;
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
    sendResponse["message"] = "Error";
    sendResponse["payloadJson"] = [];
    sendResponse["error"] = "Something went wrong!";

    return NextResponse.json(sendResponse, { status: 400 });
  }
}

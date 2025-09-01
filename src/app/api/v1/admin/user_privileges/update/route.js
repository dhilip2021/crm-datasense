import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/helper/clientHelper";
import connectMongoDB from "@/libs/mongodb";
import { UserPrivileges } from "@/models/userPrivilegesModel";

let sendResponse = {
  appStatusCode: "",
  message: "",
  payloadJson: [],
  error: "",
};

export async function PUT(request) {
  try {
    await connectMongoDB();
    const verified = verifyAccessToken();

    if (!verified.success) {
      return NextResponse.json(
        { appStatusCode: 4, message: "Unauthorized", payloadJson: [], error: verified.error },
        { status: 401 }
      );
    }

    const { roles } = await request.json();

    if (!roles || roles.length === 0) {
      return NextResponse.json(
        { appStatusCode: 4, message: "No roles provided", payloadJson: [], error: "Roles array required" },
        { status: 400 }
      );
    }

    // for (const role of roles) {
    //   if (!role._id) continue; // skip invalid records

    //   await UserPrivileges.findByIdAndUpdate(
    //     role._id,
    //     {
    //       c_role_id: role.c_role_id,
    //       c_role_privileges: role.c_role_privileges,
    //       c_menu_list: role.c_menu_list || [],
    //       c_menu_privileges: role.c_menu_privileges || [],
    //       n_status: role.n_status ?? 1,
    //       c_updatedBy: verified.data.user_id,
    //       updatedAt: new Date()
    //     },
    //     { new: true }
    //   );
    // }

    for (const role of roles) {
  const docId = role._id || role.Id; // support both

  if (!docId) continue; // skip invalid records

  await UserPrivileges.findByIdAndUpdate(
    docId,
    {
      c_role_id: role.c_role_id,
      c_role_privileges: role.c_role_privileges,
      c_menu_list: role.c_menu_list || [],
      c_menu_privileges: role.c_menu_privileges || [],
      n_status: role.n_status ?? 1,
      c_updatedBy: verified.data.user_id,
      updatedAt: new Date()
    },
    { new: true }
  );
}


    return NextResponse.json(
      { appStatusCode: 0, message: "Roles are updated successfully!", payloadJson: [], error: [] },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { appStatusCode: 4, message: "Something went wrong", payloadJson: [], error: err.message },
      { status: 500 }
    );
  }
}



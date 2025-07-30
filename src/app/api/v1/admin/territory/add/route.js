import { NextResponse } from 'next/server';
import connectMongoDB from '@/libs/mongodb';
import { create_UUID, verifyAccessToken } from '@/helper/clientHelper';
import { Territory } from '@/models/territoryModel';

let sendResponse = {
  appStatusCode: '',
  message: '',
  payloadJson: [],
  error: ''
};

export async function POST(request) {
  const { territory_name, is_group, parent_territory, n_status, n_published, Id } = await request.json();

  try {
    await connectMongoDB();
    const verified = verifyAccessToken();

    if (!verified.success) {
      sendResponse.appStatusCode = 4;
      sendResponse.message = '';
      sendResponse.payloadJson = [];
      sendResponse.error = verified.error;
      return NextResponse.json(sendResponse, { status: 400 });
    }

    if (Id) {
      const existing = await Territory.findById(Id);
      if (!existing) {
        sendResponse.appStatusCode = 4;
        sendResponse.message = '';
        sendResponse.error = 'Territory not found';
        return NextResponse.json(sendResponse, { status: 200 });
      }

      const updateData = {
        ...(territory_name && { territory_name }),
        ...(typeof is_group !== 'undefined' && { is_group }),
        ...(parent_territory && { parent_territory }),
        ...(typeof n_status !== 'undefined' && { n_status }),
        ...(typeof n_published !== 'undefined' && { n_published }),
        c_updatedBy: verified.data.user_id,
      };

      await Territory.findByIdAndUpdate(Id, updateData);
      sendResponse.appStatusCode = 0;
      sendResponse.message = 'Territory updated successfully';
      return NextResponse.json(sendResponse, { status: 200 });

    } else {
      if (!territory_name) {
        sendResponse.appStatusCode = 4;
        sendResponse.error = 'Territory name is required';
        return NextResponse.json(sendResponse, { status: 200 });
      }

      const checkDuplicate = await Territory.findOne({ territory_name });
      if (checkDuplicate) {
        sendResponse.appStatusCode = 4;
        sendResponse.error = 'Territory name already exists';
        return NextResponse.json(sendResponse, { status: 200 });
      }

      const newData = new Territory({
        territory_id: create_UUID(),
        territory_name,
        is_group,
        parent_territory: is_group ? null : parent_territory,
        c_createdBy: verified.data.user_id,
        n_status,
        n_published
      });

      await newData.save();
      sendResponse.appStatusCode = 0;
      sendResponse.message = 'Territory created successfully';
      sendResponse.payloadJson = newData;
      return NextResponse.json(sendResponse, { status: 200 });
    }

  } catch (error) {
    sendResponse.appStatusCode = 4;
    sendResponse.message = '';
    sendResponse.error = error.message || 'Something went wrong';
    return NextResponse.json(sendResponse, { status: 500 });
  }
}

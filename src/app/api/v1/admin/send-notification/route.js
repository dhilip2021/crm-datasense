// src/app/api/v1/admin/send-notification/route.js
import admin from "firebase-admin";
import path from "path";
import fs from "fs";
import { NextResponse } from "next/server";
import connectMongoDB from "@/libs/mongodb";
import { FcmDeviceToken } from "@/models/fcmDeviceTokenModel";


function initFirebaseOnce() {
  if (admin.apps && admin.apps.length) return;

  // If platform provides the env var GOOGLE_APPLICATION_CREDENTIALS, admin SDK will pick it up automatically on initializeApp()
  // if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  //   admin.initializeApp();
  //   console.log("Firebase initialized using GOOGLE_APPLICATION_CREDENTIALS.");
  //   return;
  // }

  // If user provided JSON string of service account
  if (process.env.SERVICE_ACCOUNT_JSON) {
    try {
      const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_JSON);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("Firebase initialized using SERVICE_ACCOUNT_JSON env.");
      return;
    } catch (err) {
      console.error("Invalid SERVICE_ACCOUNT_JSON:", err);
      // fallthrough
    }
  }

  // fallback: look for file in project root: process.cwd()/service_key.json
  const candidate = path.join(process.cwd(), "service_key.json");
  if (fs.existsSync(candidate)) {
    try {
      const raw = fs.readFileSync(candidate, "utf8");
      const serviceAccount = JSON.parse(raw);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("Firebase initialized using service_key.json from project root.");
      return;
    } catch (err) {
      console.error("Failed to parse service_key.json:", err);
      throw err;
    }
  }

  throw new Error(
    "Firebase service account not found. Set GOOGLE_APPLICATION_CREDENTIALS or SERVICE_ACCOUNT_JSON or put service_key.json in project root."
  );
}

initFirebaseOnce();

/**
 * Helper: fetch tokens by device type in pages, dedupe result
 */
async function fetchAllTokens(c_type, send_to) {
  const PAGE_SIZE = 1000;
  let page = 0;
  let tokens = [];
  while (true) {
    const docs = await FcmDeviceToken.find({ c_fcm_device_type: c_type,c_user_id: { $in: send_to } })
      .skip(page * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(); // lean for performance

    if (!docs || docs.length === 0) break;

    tokens.push(...docs.map((d) => d.c_fcm_device_token).filter(Boolean));
    page++;
  }

  // dedupe tokens
  return Array.from(new Set(tokens));
}

/**
 * Remove array of tokens from DB
 */
async function removeTokensFromDatabase(tokensToRemove = []) {
  if (!tokensToRemove || tokensToRemove.length === 0) return { deletedCount: 0 };

  // remove where token is in array
  const res = await FcmDeviceToken.deleteMany({
    c_fcm_device_token: { $in: tokensToRemove },
  });
  return res;
}

/**
 * Send notifications in batches and return aggregated stats & raw results summary
 */
async function sendNotificationsInBatches(registrationTokens = [], messagePayload = {}) {
  const BATCH_SIZE = 500; // FCM limit
  const aggregated = {
    totalTokens: registrationTokens.length,
    totalRequests: 0,
    successCount: 0,
    failureCount: 0,
    invalidTokens: new Set(),
    responses: [], // keep a short summary per batch
  };

  for (let i = 0; i < registrationTokens.length; i += BATCH_SIZE) {
    const batch = registrationTokens.slice(i, i + BATCH_SIZE);
    try {
      // Using sendEachForMulticast for batch token sending
      const response = await admin.messaging().sendEachForMulticast({
        tokens: batch,
        notification: messagePayload.notification,
        data: messagePayload.data,
        android: messagePayload.android,
        apns: messagePayload.apns,
        webpush: messagePayload.webpush,
      });

      aggregated.totalRequests++;
      aggregated.successCount += response.successCount;
      aggregated.failureCount += response.failureCount;

      // Collect invalid tokens from this batch
      response.responses.forEach((res, idx) => {
        if (!res.success && res.error && res.error.code) {
          const errCode = res.error.code;
          if (errCode === "messaging/registration-token-not-registered" || errCode === "messaging/invalid-registration-token") {
            aggregated.invalidTokens.add(batch[idx]);
          }
        }
      });

      aggregated.responses.push({
        batchStart: i,
        batchSize: batch.length,
        successCount: response.successCount,
        failureCount: response.failureCount,
      });
    } catch (err) {
      // Log and continue with remaining batches
      console.error("Error sending FCM batch:", err);
      aggregated.responses.push({
        batchStart: i,
        batchSize: batch.length,
        error: String(err?.message || err),
      });
    }
  }

  // Convert Set to Array for output
  aggregated.invalidTokens = Array.from(aggregated.invalidTokens);
  return aggregated;
}

/**
 * The POST handler
 */
export async function POST(request) {
  try {
    // connect DB early
    await connectMongoDB();

    const body = await request.json();
    const { title, message, link, icon, c_type,send_to } = body ?? {};

    if (!c_type) {
      return NextResponse.json({ appStatusCode: 4, message: "c_type is required", error: "invalid_request" }, { status: 400 });
    }

    // Build message payload
    const messages = {
      notification: {
        title: title || "",
        body: message || "",
        image: icon || undefined,
      },
      data: {
        link: link || "",
        imageUrl: icon || "",
        title: title || "",
        body: message || "",
      },
      android: {
        priority: "high",
      },
      apns: {
        headers: { "apns-priority": "10" },
        payload: {
          aps: {
            alert: { title: title || "", body: message || "" },
            sound: "default",
            badge: 1,
            "content-available": 1,
          },
        },
      },
      webpush: link ? { fcmOptions: { link } } : undefined,
    };

    // fetch tokens
    const registrationTokens = await fetchAllTokens(c_type,send_to);

    if (!registrationTokens || registrationTokens.length === 0) {
      return NextResponse.json(
        {
          appStatusCode: 4,
          message: "No registration tokens found",
          payloadJson: [],
          error: "no_tokens",
        },
        { status: 200 }
      );
    }

    // send
    const result = await sendNotificationsInBatches(registrationTokens, messages);

    console.log(result,"<<< NOTIFICATION SEND RESULTSS")

    // remove invalid tokens from DB (if any)
    let deleteResult = null;
    if (result.invalidTokens && result.invalidTokens.length > 0) {
      deleteResult = await removeTokensFromDatabase(result.invalidTokens);
    }

    // final response build
    const sendResponse = {
      appStatusCode: result.successCount > 0 ? 0 : 4,
      message: result.successCount > 0 ? "Notification sent (partial/complete)" : "Notification send failure",
      payloadJson: {
        totalTokens: result.totalTokens,
        successCount: result.successCount,
        failureCount: result.failureCount,
        invalidTokenCount: result.invalidTokens.length,
        invalidTokensSample: result.invalidTokens.slice(0, 10),
        batchSummaries: result.responses,
        dbDeleteResult: deleteResult,
      },
      error: null,
    };

    return NextResponse.json(sendResponse, { status: result.successCount > 0 ? 200 : 400 });
  } catch (err) {
    console.error("Send notification error:", err);
    return NextResponse.json(
      {
        appStatusCode: 4,
        message: "Notification send failure",
        payloadJson: [],
        error: String(err?.message || err),
      },
      { status: 500 }
    );
  }
}

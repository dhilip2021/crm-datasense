// src/app/api/v1/admin/send-notification/route.js
import admin from "firebase-admin";
import path from "path";
import fs from "fs";
import { NextResponse } from "next/server";
import connectMongoDB from "@/libs/mongodb";
import { FcmDeviceToken } from "@/models/fcmDeviceTokenModel";

// -----------------------------------------------------
//  FIXED FIREBASE INITIALIZATION (safe for Vercel)
// -----------------------------------------------------
function initFirebaseOnce() {
  // Prevent duplicate init
  if (admin.apps.length > 0) return;

  // 1) GOOGLE_APPLICATION_CREDENTIALS (Vercel Secret)
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    console.log("Firebase initialized via GOOGLE_APPLICATION_CREDENTIALS");
    return;
  }

  // 2) SERVICE_ACCOUNT_JSON (Single-line JSON env)
  if (process.env.SERVICE_ACCOUNT_JSON) {
    try {
      const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_JSON);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("Firebase initialized via SERVICE_ACCOUNT_JSON");
      return;
    } catch (err) {
      console.error("Invalid SERVICE_ACCOUNT_JSON:", err);
    }
  }

  // 3) Local fallback: service_key.json
  const localKeyPath = path.join(process.cwd(), "service_key.json");
  if (fs.existsSync(localKeyPath)) {
    try {
      const file = fs.readFileSync(localKeyPath, "utf8");
      const serviceAccount = JSON.parse(file);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("Firebase initialized via local service_key.json");
      return;
    } catch (err) {
      console.error("Failed to parse local key:", err);
      throw err;
    }
  }

  throw new Error("No Firebase credentials found.");
}

initFirebaseOnce();

// -----------------------------------------------------
// Fetch tokens (paged, deduped)
// -----------------------------------------------------
async function fetchAllTokens(c_type, send_to) {
  const PAGE_SIZE = 1000;
  let page = 0;
  let tokens = [];

  while (true) {
    const docs = await FcmDeviceToken.find({
      c_fcm_device_type: c_type,
      c_user_id: { $in: send_to },
    })
      .skip(page * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean();

    if (!docs || docs.length === 0) break;

    tokens.push(...docs.map((d) => d.c_fcm_device_token).filter(Boolean));
    page++;
  }

  return Array.from(new Set(tokens));
}

// -----------------------------------------------------
// Remove invalid tokens
// -----------------------------------------------------
async function removeTokensFromDatabase(tokensToRemove = []) {
  if (!tokensToRemove.length) return { deletedCount: 0 };
  return await FcmDeviceToken.deleteMany({
    c_fcm_device_token: { $in: tokensToRemove },
  });
}

// -----------------------------------------------------
// Send notifications in batches
// -----------------------------------------------------
async function sendNotificationsInBatches(registrationTokens, messagePayload) {
  const BATCH_SIZE = 500;

  const aggregated = {
    totalTokens: registrationTokens.length,
    totalRequests: 0,
    successCount: 0,
    failureCount: 0,
    invalidTokens: new Set(),
    responses: [],
  };

  for (let i = 0; i < registrationTokens.length; i += BATCH_SIZE) {
    const batch = registrationTokens.slice(i, i + BATCH_SIZE);

    try {
      const response = await admin.messaging().sendEachForMulticast({
        tokens: batch,
        ...messagePayload,
      });

      aggregated.totalRequests++;
      aggregated.successCount += response.successCount;
      aggregated.failureCount += response.failureCount;

      response.responses.forEach((res, idx) => {
        if (!res.success && res.error?.code) {
          if (
            res.error.code === "messaging/registration-token-not-registered" ||
            res.error.code === "messaging/invalid-registration-token"
          ) {
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
      aggregated.responses.push({
        batchStart: i,
        batchSize: batch.length,
        error: err.message,
      });
    }
  }

  aggregated.invalidTokens = Array.from(aggregated.invalidTokens);
  return aggregated;
}

// -----------------------------------------------------
// POST handler
// -----------------------------------------------------
export async function POST(request) {
  try {
    await connectMongoDB();

    const body = await request.json();
    const { title, message, link, icon, c_type, send_to } = body;

    if (!c_type) {
      return NextResponse.json(
        { appStatusCode: 4, message: "c_type is required", error: "invalid_request" },
        { status: 400 }
      );
    }

    // Build payload
    const payload = {
      notification: {
        title: title || "",
        body: message || "",
        image: icon || undefined,
      },
      data: {
        link: link || "",
        title: title || "",
        body: message || "",
        imageUrl: icon || "",
      },
      android: { priority: "high" },
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

    // Fetch tokens
    const registrationTokens = await fetchAllTokens(c_type, send_to);

    if (!registrationTokens.length) {
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

    // Send notification
    const result = await sendNotificationsInBatches(registrationTokens, payload);
    console.log(result, "<<< NOTIFICATION SEND RESULTSS");

    // Remove invalid tokens
    let deleteResult = null;
    if (result.invalidTokens.length > 0) {
      deleteResult = await removeTokensFromDatabase(result.invalidTokens);
    }

    return NextResponse.json(
      {
        appStatusCode: result.successCount > 0 ? 0 : 4,
        message:
          result.successCount > 0
            ? "Notification sent (partial/complete)"
            : "Notification failed",
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
      },
      { status: result.successCount > 0 ? 200 : 400 }
    );
  } catch (err) {
    console.error("Send notification error:", err);
    return NextResponse.json(
      {
        appStatusCode: 4,
        message: "Notification send failure",
        payloadJson: [],
        error: err.message,
      },
      { status: 500 }
    );
  }
}

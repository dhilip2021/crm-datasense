import admin from "firebase-admin";

let firebaseApp;

export function getFirebaseAdmin() {
  if (firebaseApp) return admin;

  const serviceJson = process.env.SERVICE_ACCOUNT_JSON;

  if (!serviceJson) {
    throw new Error("SERVICE_ACCOUNT_JSON missing in env");
  }

  const serviceAccount = JSON.parse(serviceJson);

  // convert private_key string → with real line breaks
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

  if (admin.apps.length === 0) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("🔥 Firebase Admin Initialized");
  } else {
    firebaseApp = admin.app();
    console.log("♻️ Firebase Admin Reused");
  }

  return admin;
}

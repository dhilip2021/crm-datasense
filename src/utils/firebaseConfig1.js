import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";



const firebaseConfig = {
  apiKey: "AIzaSyDTQ9jFV8CgruJpVGTWghHSffDuQNY1obo",
  authDomain: "test-demo-184c4.firebaseapp.com",
  projectId: "test-demo-184c4",
  storageBucket: "test-demo-184c4.firebasestorage.app",
  messagingSenderId: "90612296981",
  appId: "1:90612296981:web:afe0ac5cdac57f55040d1c",
  measurementId: "G-1Q43PJRQ5H"
};


const firebaseApp1 = initializeApp(firebaseConfig);
let messaging;

if (typeof window !== "undefined") {
  messaging = getMessaging(firebaseApp1);

  // ✅ Ask permission & always fetch fresh token
  const requestPermissionAndToken = async () => {
    try {
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        const token = await getToken(messaging, {
          vapidKey:"BDTMsl_O6Qvn779hn3l8RIkMTmerD4APec2sW8WG0jFTrd6BwXsrrjHsuqfgcr86KozsIR0gSl_6EaHBolGJri8"
        });

        if (token) {
          console.log("✅ Fresh FCM Token:", token);
        //   await saveTokenToServer(token);
        }
      } else {
        console.error("❌ Permission not granted for notifications");
      }
    } catch (error) {
      console.error("🔥 Error getting token:", error);
    }
  };

  // ✅ Save token to backend
  const saveTokenToServer = async (token) => {
    try {
      await fetch("/api/save-fcm-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });
      console.log("📡 Token sent to server:", token);
    } catch (err) {
      console.error("❌ Failed to save token:", err);
    }
  };

  // ✅ Call once on load (always gives latest token)
  requestPermissionAndToken();

  // ✅ Foreground message listener
  onMessage(messaging, (payload) => {
    console.log("📩 Foreground push received:", payload);
  });
}

export { messaging, getToken };

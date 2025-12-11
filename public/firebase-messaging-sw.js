importScripts('https://www.gstatic.com/firebasejs/9.6.11/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.11/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyATiDbkxB9BZs2mEuFOQYrHcjubMoKXlDM",
  authDomain: "test-demo-184c4.firebaseapp.com",
  projectId: "test-demo-184c4",
  storageBucket: "test-demo-184c4.firebasestorage.app",
  messagingSenderId: "90612296981",
  appId: "1:90612296981:web:53e2aec5a64693d9040d1c",
  measurementId: "G-EFC42WC743"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message: ', payload);

  const notificationTitle = payload.notification.title || "New Message";
  const notificationBody = payload.notification.body || "";
  const notificationIcon = payload.notification.icon || "/icons/icon-192x192.png"; // ✔️ SAFE
  const notificationImage = payload.notification.image || undefined; // optional

  const options = {
    body: notificationBody,
    icon: notificationIcon,
  };

  // Add image only if available
  if (notificationImage) {
    options.image = notificationImage;
  }

  self.registration.showNotification(notificationTitle, options);
});

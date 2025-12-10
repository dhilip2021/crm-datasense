importScripts('https://www.gstatic.com/firebasejs/9.6.11/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.11/firebase-messaging-compat.js');

firebase.initializeApp({
 apiKey: "AIzaSyDTQ9jFV8CgruJpVGTWghHSffDuQNY1obo",
  authDomain: "test-demo-184c4.firebaseapp.com",
  projectId: "test-demo-184c4",
  storageBucket: "test-demo-184c4.firebasestorage.app",
  messagingSenderId: "90612296981",
  appId: "1:90612296981:web:afe0ac5cdac57f55040d1c",
  measurementId: "G-1Q43PJRQ5H"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message: ', payload);

  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: payload.notification.image
  });
});

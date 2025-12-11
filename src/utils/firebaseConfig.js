import { initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyATiDbkxB9BZs2mEuFOQYrHcjubMoKXlDM",
  authDomain: "test-demo-184c4.firebaseapp.com",
  projectId: "test-demo-184c4",
  storageBucket: "test-demo-184c4.firebasestorage.app",
  messagingSenderId: "90612296981",
  appId: "1:90612296981:web:53e2aec5a64693d9040d1c",
  measurementId: "G-EFC42WC743"
};

const app = initializeApp(firebaseConfig);

let messaging = null;

if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      messaging = getMessaging(app);
    }
  });
}

export { messaging };

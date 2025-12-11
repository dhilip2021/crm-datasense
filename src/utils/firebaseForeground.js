import { onMessage } from "firebase/messaging";
import { messaging } from "./firebaseConfig";

export function listenForForegroundNotifications(callback) {
  if (!messaging) return;
  onMessage(messaging, (payload) => {
    callback(payload);
  });
}

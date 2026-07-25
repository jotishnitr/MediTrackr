import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// register service worker once, module load time
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register(`${import.meta.env.BASE_URL}firebase-messaging-sw.js`)
    .then((reg) => console.log("SW registered:", reg))
    .catch((err) => console.error("SW registration failed:", err));
}

export const requestFCMToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission denied.");
      return null;
    }

    let registration;
    if ("serviceWorker" in navigator) {
      registration = await navigator.serviceWorker.ready;
    }

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
      serviceWorkerRegistration: registration,
    });

    return token;
  } catch (err) {
    console.error("Error getting FCM token:", err);
    return null;
  }
};

export const listenForForegroundMessages = () => {
  onMessage(messaging, (payload) => {
    console.log("Foreground message received:", payload);
  });
};

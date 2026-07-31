importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyCIrYbosj6nVwcM_7z9R501IvR30FeJ64Y",
  authDomain: "meditrackr-b0ba4.firebaseapp.com",
  projectId: "meditrackr-b0ba4",
  storageBucket: "meditrackr-b0ba4.firebasestorage.app",
  messagingSenderId: "773880457316",
  appId: "PASTE_YOUR_ACTUAL_APP_ID_HERE",
  // grab this from your console.log output — "appId" field, wasn't visible in your screenshot (got cut off)
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Background message received:", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icon.png",
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

const admin = require("firebase-admin");
const { getMessaging } = require("firebase-admin/messaging");

// Safely initialize if not already initialized
if (admin.getApps().length === 0) {
  try {
    const projectId = (process.env.FIREBASE_PROJECT_ID || process.env.project_id || "").trim();
    const clientEmail = (process.env.FIREBASE_CLIENT_EMAIL || process.env.client_email || "").trim();
    let privateKey = (process.env.FIREBASE_PRIVATE_KEY || process.env.private_key || "").trim();

    if (privateKey) {
      privateKey = privateKey.replace(/\\n/g, "\n");
    }

    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log("[Firebase Admin] Initialized successfully.");
    } else {
      console.warn("[Firebase Admin] Missing or incomplete Firebase credentials. Push notifications will be skipped safely.");
    }
  } catch (initErr) {
    console.error("[Firebase Admin] Initialization error:", initErr.message);
  }
}

// Attach messaging method to admin for Firebase Admin v12+ compatibility
admin.messaging = (app) => {
  if (admin.getApps().length === 0) {
    return {
      sendEachForMulticast: async () => ({
        successCount: 0,
        failureCount: 0,
        responses: [],
      }),
      send: async () => ({}),
      sendEach: async () => ({
        successCount: 0,
        failureCount: 0,
        responses: [],
      }),
    };
  }
  return app ? getMessaging(app) : getMessaging();
};

module.exports = admin;

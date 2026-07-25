const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.cert({
    projectId: (process.env.FIREBASE_PROJECT_ID || process.env.project_id || "").trim(),
    clientEmail: (process.env.FIREBASE_CLIENT_EMAIL || process.env.client_email || "").trim(),
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || process.env.private_key || "").trim().replace(/\\n/g, "\n"),
  }),
});

module.exports = admin;

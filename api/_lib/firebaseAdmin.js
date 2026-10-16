// Server-side Firebase (Admin SDK). Bypasses Firestore rules, so only use it inside /api.
const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");

if (!getApps().length) {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT env var is missing");
  // Accept either the raw JSON or a base64 encoding of it
  const json = raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
  initializeApp({ credential: cert(JSON.parse(json)) });
}

module.exports = { db: getFirestore(), auth: getAuth() };

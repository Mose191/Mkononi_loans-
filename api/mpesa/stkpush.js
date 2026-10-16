// POST /api/mpesa/stkpush   (Authorization: Bearer <Firebase ID token>)  body: { phone }
// Sends the M-Pesa PIN prompt to the customer's phone. The amount is decided HERE, not by the browser.
const { db } = require("../_lib/firebaseAdmin");
const { verifyUser } = require("../_lib/verifyUser");
const { normalizePhone, stkPush } = require("../_lib/mpesa");

const ACTIVATION_FEE = Number(process.env.ACTIVATION_FEE || 100);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const uid = await verifyUser(req);
    if (!uid) return res.status(401).json({ error: "Please sign in again." });

    const phone = normalizePhone(req.body && req.body.phone);
    if (!phone) return res.status(400).json({ error: "Enter a valid Safaricom number, e.g. 0712345678." });

    const userSnap = await db.collection("users").doc(uid).get();
    if (!userSnap.exists) return res.status(400).json({ error: "Profile not found." });
    if (userSnap.data().activated) return res.status(400).json({ error: "Your account is already activated." });

    // Stop people (or double-clicks) from spamming prompts: one pending request per minute
    const recent = await db
      .collection("payments")
      .where("uid", "==", uid)
      .where("status", "==", "pending")
      .get();
    const now = Date.now();
    const tooSoon = recent.docs.find((d) => now - d.data().createdAt < 60 * 1000);
    if (tooSoon) {
      return res.status(429).json({
        error: "A payment prompt was just sent. Check your phone, or wait a minute and try again.",
      });
    }

    const appUrl = (process.env.APP_URL || "").replace(/\/$/, "");
    if (!appUrl.startsWith("https://")) throw new Error("APP_URL must be your public https:// site URL");
    const callbackUrl = `${appUrl}/api/mpesa/callback?key=${encodeURIComponent(process.env.MPESA_CALLBACK_SECRET || "")}`;

    const { ok, data } = await stkPush({
      phone,
      amount: ACTIVATION_FEE,
      callbackUrl,
      accountReference: "Mkononi",
      description: "Activation",
    });

    if (!ok) {
      console.error("STK push rejected:", JSON.stringify(data));
      return res.status(502).json({ error: "Couldn't send the M-Pesa prompt. Please try again." });
    }

    await db.collection("payments").doc(data.CheckoutRequestID).set({
      uid,
      phone,
      amount: ACTIVATION_FEE,
      purpose: "activation",
      status: "pending",
      merchantRequestId: data.MerchantRequestID || null,
      createdAt: now,
    });

    return res.status(200).json({ checkoutRequestId: data.CheckoutRequestID });
  } catch (err) {
    console.error("stkpush error:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
};

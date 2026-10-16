// GET /api/mpesa/status?id=<CheckoutRequestID>  (Authorization: Bearer <Firebase ID token>)
// Lets the page check progress, and recovers payments whose callback never arrived.
const { db } = require("../_lib/firebaseAdmin");
const { verifyUser } = require("../_lib/verifyUser");
const { stkQuery } = require("../_lib/mpesa");
const { finalizePayment } = require("../_lib/finalize");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const uid = await verifyUser(req);
    if (!uid) return res.status(401).json({ error: "Please sign in again." });

    const id = String((req.query && req.query.id) || "");
    if (!id) return res.status(400).json({ error: "Missing id" });

    const ref = db.collection("payments").doc(id);
    let snap = await ref.get();
    if (!snap.exists || snap.data().uid !== uid) return res.status(404).json({ error: "Payment not found" });

    let pay = snap.data();

    // Callback hasn't landed after 20s: ask Safaricom directly
    if (pay.status === "pending" && Date.now() - pay.createdAt > 20 * 1000) {
      const { data } = await stkQuery(id);
      if (data && data.ResultCode !== undefined && data.ResultCode !== null && data.ResultCode !== "") {
        await finalizePayment(id, {
          resultCode: data.ResultCode,
          resultDesc: data.ResultDesc,
          amount: null, // the query response doesn't carry the amount
          receipt: null,
          phone: null,
        });
        snap = await ref.get();
        pay = snap.data();
      }
    }

    const message =
      pay.status === "failed" ? pay.resultDesc || "Payment was not completed." :
      pay.status === "review" ? "We received your payment but need to check it. Please contact support." : "";
    return res.status(200).json({ status: pay.status, message });
  } catch (err) {
    console.error("status error:", err);
    return res.status(500).json({ error: "Something went wrong." });
  }
};

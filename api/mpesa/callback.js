// POST /api/mpesa/callback?key=SECRET   <- called by Safaricom, not by the browser
const crypto = require("crypto");
const { finalizePayment } = require("../_lib/finalize");

const ack = { ResultCode: 0, ResultDesc: "Accepted" };

function keyIsValid(given) {
  const expected = process.env.MPESA_CALLBACK_SECRET || "";
  if (!expected || typeof given !== "string") return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  // Only requests that know our secret URL key are trusted
  if (!keyIsValid(req.query && req.query.key)) {
    console.warn("Callback rejected: bad key");
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const cb = req.body && req.body.Body && req.body.Body.stkCallback;
    if (!cb || !cb.CheckoutRequestID) return res.status(200).json(ack);

    const items = (cb.CallbackMetadata && cb.CallbackMetadata.Item) || [];
    const pick = (name) => (items.find((i) => i.Name === name) || {}).Value;

    const result = await finalizePayment(cb.CheckoutRequestID, {
      resultCode: cb.ResultCode,
      resultDesc: cb.ResultDesc,
      amount: pick("Amount"),
      receipt: pick("MpesaReceiptNumber"),
      phone: pick("PhoneNumber"),
    });
    console.log("M-Pesa callback", cb.CheckoutRequestID, cb.ResultCode, result.status);
  } catch (err) {
    console.error("callback error:", err);
  }
  // Always acknowledge so Safaricom doesn't treat delivery as failed
  return res.status(200).json(ack);
};

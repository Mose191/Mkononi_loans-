// Safaricom Daraja helpers (M-Pesa Express / STK Push)
const BASE_URL =
  process.env.MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} env var is missing`);
  return v;
}

// yyyymmddhhmmss in Nairobi time (UTC+3)
function timestamp() {
  return new Date(Date.now() + 3 * 3600 * 1000).toISOString().replace(/\D/g, "").slice(0, 14);
}

function password(ts) {
  return Buffer.from(requireEnv("MPESA_SHORTCODE") + requireEnv("MPESA_PASSKEY") + ts).toString("base64");
}

// 0712345678 / 0112345678 / +254712345678 / 254712345678 / 712345678 -> 254712345678
function normalizePhone(input) {
  let p = String(input || "").replace(/[\s-]/g, "");
  if (p.startsWith("+")) p = p.slice(1);
  if (p.startsWith("0")) p = "254" + p.slice(1);
  else if (/^[17]\d{8}$/.test(p)) p = "254" + p;
  return /^254[17]\d{8}$/.test(p) ? p : null;
}

async function getAccessToken() {
  const basic = Buffer.from(
    `${requireEnv("MPESA_CONSUMER_KEY")}:${requireEnv("MPESA_CONSUMER_SECRET")}`
  ).toString("base64");
  const res = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${basic}` },
  });
  if (!res.ok) throw new Error(`Daraja auth failed (${res.status})`);
  const data = await res.json();
  return data.access_token;
}

async function stkPush({ phone, amount, callbackUrl, accountReference, description }) {
  const token = await getAccessToken();
  const ts = timestamp();
  const shortcode = requireEnv("MPESA_SHORTCODE");
  const body = {
    BusinessShortCode: shortcode,
    Password: password(ts),
    Timestamp: ts,
    // CustomerPayBillOnline for a Paybill, CustomerBuyGoodsOnline for a Till
    TransactionType: process.env.MPESA_TRANSACTION_TYPE || "CustomerPayBillOnline",
    Amount: amount,
    PartyA: phone,
    // For a Till number, PartyB is the Till; for a Paybill it is the Paybill
    PartyB: process.env.MPESA_PARTY_B || shortcode,
    PhoneNumber: phone,
    CallBackURL: callbackUrl,
    AccountReference: accountReference.slice(0, 12),
    TransactionDesc: description.slice(0, 13),
  };
  const res = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok && String(data.ResponseCode) === "0", data };
}

async function stkQuery(checkoutRequestId) {
  const token = await getAccessToken();
  const ts = timestamp();
  const res = await fetch(`${BASE_URL}/mpesa/stkpushquery/v1/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      BusinessShortCode: requireEnv("MPESA_SHORTCODE"),
      Password: password(ts),
      Timestamp: ts,
      CheckoutRequestID: checkoutRequestId,
    }),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

module.exports = { timestamp, password, normalizePhone, stkPush, stkQuery };

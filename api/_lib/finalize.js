// Marks an activation payment as paid/failed. Safe to call many times for the same payment
// (the callback can arrive twice, and the status endpoint may race with it).
const { db } = require("./firebaseAdmin");

const todayLabel = () =>
  new Date(Date.now() + 3 * 3600 * 1000).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "EAT",
  });

async function finalizePayment(checkoutRequestId, { resultCode, resultDesc, amount, receipt, phone }) {
  const payRef = db.collection("payments").doc(checkoutRequestId);

  return db.runTransaction(async (t) => {
    const snap = await t.get(payRef);
    if (!snap.exists) return { status: "unknown" };
    const pay = snap.data();
    if (pay.status !== "pending") return { status: pay.status }; // already handled

    if (Number(resultCode) !== 0) {
      t.update(payRef, { status: "failed", resultCode: Number(resultCode), resultDesc: resultDesc || "", finishedAt: Date.now() });
      return { status: "failed", message: resultDesc || "Payment was not completed." };
    }

    // Money was taken, but check it's the amount we asked for before activating
    if (amount != null && Number(amount) !== Number(pay.amount)) {
      t.update(payRef, {
        status: "review",
        resultCode: 0,
        resultDesc: `Amount mismatch: expected ${pay.amount}, got ${amount}`,
        receipt: receipt || null,
        finishedAt: Date.now(),
      });
      return { status: "review", message: "Payment amount didn't match. Contact support." };
    }

    t.update(payRef, {
      status: "success",
      resultCode: 0,
      resultDesc: resultDesc || "",
      receipt: receipt || null,
      paidPhone: phone ? String(phone) : pay.phone,
      finishedAt: Date.now(),
    });
    t.set(
      db.collection("users").doc(pay.uid),
      { activated: true, activatedAt: Date.now(), activationReceipt: receipt || null },
      { merge: true }
    );
    t.set(db.collection("users").doc(pay.uid).collection("transactions").doc(), {
      type: "Fees",
      direction: "out",
      title: "Account Activation",
      reference: receipt ? `M-Pesa ${receipt}` : "Activation fee",
      date: todayLabel(),
      amount: pay.amount,
      status: "Successful",
      createdAt: new Date().toISOString(),
    });
    return { status: "success" };
  });
}

module.exports = { finalizePayment };

const { auth } = require("./firebaseAdmin");

// Reads "Authorization: Bearer <Firebase ID token>" and returns the user's uid (or null)
async function verifyUser(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  try {
    const decoded = await auth.verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}

module.exports = { verifyUser };

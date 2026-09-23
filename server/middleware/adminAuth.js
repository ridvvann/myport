import crypto from "crypto";

// A minimal single-user session store. Good enough for a one-person admin
// panel behind a password; tokens live in memory and reset on server
// restart. For anything more sensitive, swap this for Supabase Auth.
const validTokens = new Set();

export function issueToken() {
  const token = crypto.randomBytes(24).toString("hex");
  validTokens.add(token);
  return token;
}

export function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token || !validTokens.has(token)) {
    return res.status(401).json({ error: "Not authorized." });
  }
  next();
}

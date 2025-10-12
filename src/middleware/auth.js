const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware pentru autentificare
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing token" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = payload.id || payload.uid;

    const user = await User.findById(userId).select(
      "_id email name surname role subscriptions active"
    );

    if (!user || !user.active) {
      return res.status(401).json({ error: "Invalid user" });
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      surname: user.surname,
      role: user.role,
      subscriptions: Array.isArray(user.subscriptions)
        ? user.subscriptions
        : [],
    };

    next();
  } catch (err) {
    console.error("[requireAuth]", err.message);
    res.status(401).json({ error: "Unauthorized" });
  }
}

// Middleware pentru roluri
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}

// ✅ Middleware pentru verificare abonament valid (versiune corectată)
function requireValidSubscription(req, res, next) {
  // admin și prof → acces oricum
  if (req.user && (req.user.role === "admin" || req.user.role === "prof")) {
    return next();
  }

  const validSubs = ["bio1", "bio2", "chim1", "chim2", "adm1", "adm2"];
  const subs = Array.isArray(req.user?.subscriptions)
    ? req.user.subscriptions
    : [];

  const now = new Date();
  const hasValid = subs.some((s) => {
    const type = s.plan || s.type || s.name; // în funcție de structura ta
    const endDate = new Date(s.endDate || s.expiry || s.validUntil);
    return validSubs.includes(type) && endDate > now;
  });

  if (!hasValid) {
    return res
      .status(403)
      .json({ error: "Nu ai un abonament activ care să îți permită accesul." });
  }

  next();
}

module.exports = {
  requireAuth,
  requireRole,
  requireValidSubscription,
};

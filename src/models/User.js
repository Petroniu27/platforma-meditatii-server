const jwt = require("jsonwebtoken");
const { z } = require("zod");
const User = require("../models/User");

// 🔒 Validări cu Zod
const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  surname: z.string().min(2).optional(),
  phone: z.string().min(6).optional(),
  password: z.string().min(6),
  role: z.enum(["student", "prof", "admin"]).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// 🔐 Funcție pentru generare JWT
function signToken(id, role) {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "7d",
  });
}

// 🟢 REGISTER
async function register(req, res) {
  try {
    const data = registerSchema.parse(req.body);

    const exists = await User.findOne({ email: data.email });
    if (exists) {
      return res.status(409).json({ error: "Email deja folosit" });
    }

    const user = await User.create({
      ...data,
      subscriptions: [],
    });

    const token = signToken(user._id, user.role);

    return res.status(201).json({
      token,
      user: formatUser(user),
    });
  } catch (e) {
    console.error("❌ Eroare la REGISTER:", e);
    return res.status(400).json({
      error: e.errors?.[0]?.message || e.message || "Date invalide",
    });
  }
}

// 🟡 LOGIN
async function login(req, res) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email }).select(
      "+password role name surname phone email subscriptions"
    );

    console.log("➡️ USER GASIT:", user);

    if (!user) {
      return res.status(401).json({ error: "Email sau parolă greșite" });
    }

    const ok = await user.comparePassword(password);
    console.log("✅ PAROLA OK:", ok);

    if (!ok) {
      return res.status(401).json({ error: "Email sau parolă greșite" });
    }

    const token = signToken(user._id, user.role);

    return res.status(200).json({
      token,
      user: formatUser(user),
    });
  } catch (e) {
    console.error("❌ Eroare la LOGIN:", e);
    return res.status(400).json({
      error: e.errors?.[0]?.message || e.message || "Date invalide",
    });
  }
}

// 🧠 GET /auth/me – returnează userul logat (din token)
async function me(req, res) {
  try {
    const user = await User.findById(req.user.id).select(
      "email name surname phone role subscriptions"
    );

    if (!user) {
      return res.status(404).json({ error: "User inexistent" });
    }

    res.json({ user: formatUser(user) });
  } catch (e) {
    console.error("❌ Eroare la ME:", e);
    res.status(500).json({ error: e.message || "Eroare server" });
  }
}

// 📦 Helper pentru a trimite doar câmpurile relevante
function formatUser(user) {
  return {
    id: user._id,
    email: user.email,
    name: user.name,
    surname: user.surname || "",
    phone: user.phone || "",
    role: user.role,
    subscriptions: user.subscriptions || [],
  };
}

module.exports = { register, login, me };

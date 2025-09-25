const express = require("express");
const { register, login } = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

/**
 * POST /api/auth/register
 */
router.post("/register", register);

/**
 * POST /api/auth/login
 */
router.post("/login", login);

/**
 * GET /api/auth/me
 */
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "name surname email role subscriptions"
    );

    if (!user) {
      return res.status(404).json({ error: "Utilizatorul nu a fost găsit" });
    }

    res.json({
      id: user._id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      role: user.role,
      subscriptions: user.subscriptions || [],
    });
  } catch (err) {
    console.error("[auth/me error]", err.message);
    res.status(500).json({ error: "Eroare server la /me" });
  }
});

module.exports = router;

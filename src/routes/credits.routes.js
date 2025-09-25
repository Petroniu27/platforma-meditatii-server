const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const { getMyCredits } = require("../controllers/credits.controller");

// 🔹 Elevul logat își vede creditele
router.get("/me", requireAuth, getMyCredits);

// 🔴 NU mai avem POST /buy-extra aici
// cumpărarea de credite se face acum prin /api/payments/buy-credit

module.exports = router;

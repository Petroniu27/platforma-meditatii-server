// === routes/ascultari.routes.js ===
const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const {
  bookSession,
  getMyBookings,
  getMyCredits,
  buyExtraCredits,
  getAvailability,
  getSlots,
} = require("../controllers/ascultari.controller");

// === CREDITE ===
router.get("/credits/me", requireAuth, requireRole("student"), getMyCredits);
router.post("/credits/buy-extra", requireAuth, requireRole("student"), buyExtraCredits);

// === BOOKING ===
router.get("/bookings/me", requireAuth, requireRole("student"), getMyBookings);
router.post("/bookings", requireAuth, requireRole("student"), bookSession);

// === PROFESORI ===
router.get("/availability", requireAuth, requireRole("student"), getAvailability);

// === SLOTURI ===
router.get("/slots", requireAuth, requireRole("student"), getSlots);

module.exports = router;

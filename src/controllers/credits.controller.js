// server/src/controllers/credits.controller.js
const mongoose = require("mongoose");
const StudentCredits = require("../models/StudentCredits");

// 🔹 GET /api/credits/me
// Returnează creditele pentru elevul logat (sau creează înregistrarea dacă nu există)
const getMyCredits = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ message: "Neautorizat: lipsește utilizatorul" });
    }

    const studentId = new mongoose.Types.ObjectId(req.user.id);
    const period = new Date().toISOString().slice(0, 7); // ex: "2025-09"

    let credits = await StudentCredits.findOne({ studentId, period });

    if (!credits) {
      credits = new StudentCredits({
        studentId,
        period,
        included: 0,
        extraBought: 0,
        used: 0,
      });
      await credits.save();
    }

    // ✅ calculăm disponibilele pe baza câmpurilor
    const available =
      (credits.included || 0) + (credits.extraBought || 0) - (credits.used || 0);

    res.json({
      studentId: credits.studentId,
      period: credits.period,
      included: credits.included,
      extraBought: credits.extraBought,
      used: credits.used,
      available,
    });
  } catch (err) {
    console.error("[getMyCredits]", err);
    res.status(500).json({
      message: "Eroare la obținerea creditelor",
      error: err.message,
    });
  }
};

module.exports = { getMyCredits };

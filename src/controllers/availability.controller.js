const Availability = require("../models/Availability");
const User = require("../models/User");

// Returnează profesorii disponibili pentru ascultări
exports.getAvailableProfessors = async (req, res) => {
  try {
    const list = await Availability.find({ active: true }).populate("profId", "name email role");
    res.json(list);
  } catch (err) {
    console.error("getAvailableProfessors error:", err);
    res.status(500).json({ error: err.message });
  }
};

const Booking = require("../models/Booking");
const User = require("../models/User");
const StudentCredits = require("../models/StudentCredits");
const Availability = require("../models/Availability"); // 👈 import nou

function currentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// Creează o programare dacă are credit disponibil
exports.bookSession = async (req, res) => {
  try {
    const { profId, start, end, topicId, notes } = req.body;
    const studentId = req.user.id;

    // verificăm abonamentul (folosim subscriptions array)
    const student = await User.findById(studentId);
    const subs = Array.isArray(student.subscriptions)
      ? student.subscriptions.map((s) => s.toLowerCase())
      : [];

    if (
      !subs.some((s) =>
        ["bio1", "bio2", "chim1", "chim2", "adm1", "adm2"].includes(s)
      )
    ) {
      return res
        .status(403)
        .json({ error: "Abonamentul nu permite ascultări." });
    }

    const period = currentPeriod();
    const credits = await StudentCredits.getOrCreate(studentId, period);

    if (credits.available <= 0) {
      return res.status(400).json({ error: "Nu mai ai credite disponibile." });
    }

    // salvăm sesiunea
    const newBooking = await Booking.create({
      studentId,
      mentorId: profId, // 👈 FIX: în schema Booking câmpul e mentorId
      start,
      end,
      topicId,
      notes,
      status: "booked",
    });

    // scădem un credit
    credits.used += 1;
    await credits.save();

    // ❌ NU mai marcăm slotul ca ocupat → rămâne disponibil pentru alți elevi

    res.status(201).json(newBooking);
  } catch (err) {
    console.error("bookSession error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Returnează sesiunile proprii ale elevului
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ studentId: req.user.id }).sort({
      start: 1,
    });
    res.json(bookings);
  } catch (err) {
    console.error("getMyBookings error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Returnează creditele elevului
exports.getMyCredits = async (req, res) => {
  try {
    const studentId = req.user.id;
    const period = currentPeriod();
    const credits = await StudentCredits.getOrCreate(studentId, period);
    res.json({
      included: credits.included,
      extraBought: credits.extraBought,
      used: credits.used,
      available: credits.available,
    });
  } catch (err) {
    console.error("getMyCredits error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Adaugă credite extra cumpărate
exports.buyExtraCredits = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { units } = req.body;
    const period = currentPeriod();
    const credits = await StudentCredits.getOrCreate(studentId, period);
    credits.extraBought += Number(units) || 0;
    await credits.save();
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("buyExtraCredits error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Returnează profesorii disponibili
exports.getAvailability = async (req, res) => {
  try {
    const profs = await User.find({ role: "prof", active: true }).select(
      "_id name email"
    );
    const result = profs.map((p) => ({ profId: p }));
    res.json(result);
  } catch (err) {
    console.error("getAvailability error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Returnează sloturile disponibile din Mongo
exports.getSlots = async (_req, res) => {
  try {
    const now = new Date();
    const slots = await Availability.find({
      isActive: true,
      start: { $gte: now },
    })
      .sort({ start: 1 })
      .select("start durationMin mentorId");

    const result = slots.map((s) => ({
      id: s._id,
      start: s.start,
      duration: s.durationMin,
      mentorId: s.mentorId,
    }));

    res.json(result);
  } catch (err) {
    console.error("getSlots error:", err);
    res.status(500).json({ error: err.message });
  }
};

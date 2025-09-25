// server/src/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// === IMPORT ROUTES ===
const payments = require("./routes/payments"); // { router, handleStripeWebhook }
const videosRouter = require("./routes/videos");
const evaluationRouter = require("./routes/evaluation.routes");
const contactRouter = require("./routes/contact.routes");
const authRouter = require("./routes/auth.routes");
const ascultariRouter = require("./routes/ascultari.routes"); // 👈 aici avem bookings + credits + availability

// === STRIPE WEBHOOK (raw body - doar pentru webhook) ===
// ⚠️ atenție: webhook-ul trebuie declarat înainte de express.json()
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  payments.handleStripeWebhook
);

// === MIDDLEWARE GLOBAL ===
app.use(cors());
app.use(express.json()); // 👈 după .raw, altfel sparge webhookul

// === ROUTES ===
app.use("/api/payments", payments.router); // rute normale de payments
app.use("/api/videos", videosRouter);
app.use("/api/evaluations", evaluationRouter);
app.use("/api/contact", contactRouter);
app.use("/api/auth", authRouter);
app.use("/api/ascultari", ascultariRouter); // 👈 tot ce ține de ascultări

// === HEALTHCHECK ===
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

// === START SERVER ===
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI;

async function start() {
  try {
    if (!MONGO_URI) throw new Error("Missing MONGO_URI in .env");
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup error:", err.message);
    process.exit(1);
  }
}

start();

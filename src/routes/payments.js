const express = require("express");
const Stripe = require("stripe");
const { requireAuth } = require("../middleware/auth");
const StudentCredits = require("../models/StudentCredits");
const User = require("../models/User");

const router = express.Router();

// === ENV ===
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const PRICE_CREDIT = process.env.STRIPE_PRICE_ID_CREDIT || "";

if (!STRIPE_SECRET_KEY) {
  console.warn("[payments] Missing STRIPE_SECRET_KEY in .env");
}

const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2022-11-15" })
  : null;

const PRICE_TO_CODE = {
  [process.env.STRIPE_PRICE_ID_BIO1]: "bio1",
  [process.env.STRIPE_PRICE_ID_BIO2]: "bio2",
  [process.env.STRIPE_PRICE_ID_CHIM1]: "chim1",
  [process.env.STRIPE_PRICE_ID_CHIM2]: "chim2",
  [process.env.STRIPE_PRICE_ID_ADM1]: "adm1",
  [process.env.STRIPE_PRICE_ID_ADM2]: "adm2",
};

// === 🔹 SUBSCRIPTIONS ===
router.post("/checkout-subscription", requireAuth, express.json(), async (req, res) => {
  if (!stripe) return res.status(503).json({ error: "Stripe not configured" });

  const { priceId } = req.body;
  if (!priceId) return res.status(400).json({ error: "Lipsește priceId" });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${FRONTEND_URL}/abonamente?status=success`,
      cancel_url: `${FRONTEND_URL}/abonamente?status=cancel`,
      allow_promotion_codes: true,
      customer_email: req.user.email,
      metadata: { userId: req.user.id, priceId },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("[stripe] subscription error:", err.message);
    res.status(500).json({ error: "Stripe error creating subscription" });
  }
});

// === 🔹 CREDITS (one-time) ===
router.post("/buy-credit", requireAuth, express.json(), async (req, res) => {
  if (!stripe) return res.status(503).json({ error: "Stripe not configured" });
  if (!PRICE_CREDIT) {
    return res.status(400).json({ error: "Missing STRIPE_PRICE_ID_CREDIT" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: PRICE_CREDIT, quantity: 1 }],
      success_url: `${FRONTEND_URL}/ascultari?status=success`,
      cancel_url: `${FRONTEND_URL}/ascultari?status=cancel`,
      customer_email: req.user.email,
      metadata: { userId: req.user.id, itemType: "credit", priceId: PRICE_CREDIT },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("[stripe] buy-credit error:", err.message);
    res.status(500).json({ error: "Stripe error creating session" });
  }
});

// === 🔹 WEBHOOK ===
const handleStripeWebhook = async (req, res) => {
  if (!stripe || !STRIPE_WEBHOOK_SECRET) return res.status(200).send();

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("[stripe] webhook verify failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const metaPrice = session.metadata?.priceId;

        if (!userId) break;

        if (session.mode === "subscription") {
          const code = PRICE_TO_CODE[metaPrice] || null;
          if (!code) break;

          const user = await User.findById(userId);
          let subs = user.subscriptions || [];

          // 🔹 Upgrade logic (păstrat identic)
          if (code === "bio2") subs = subs.filter(s => s.plan !== "bio1");
          if (code === "chim2") subs = subs.filter(s => s.plan !== "chim1");

          if (code.startsWith("adm")) {
            subs = subs.filter(s => !["bio1", "chim1"].includes(s.plan));
          }

          // 🔹 Adăugare abonament nou cu dată de început și sfârșit (30 zile)
          const start = new Date();
          const end = new Date();
          end.setDate(start.getDate() + 30);

          // Înlocuiește dacă există deja același plan, altfel adaugă
          const existingIndex = subs.findIndex(s => s.plan === code);
          if (existingIndex >= 0) {
            subs[existingIndex] = { plan: code, startDate: start, endDate: end };
          } else {
            subs.push({ plan: code, startDate: start, endDate: end });
          }

          user.subscriptions = subs;
          await user.save();

          console.log(`✅ Subscriptions actualizate pentru user ${userId}:`, subs);

          // 🔹 Credite bonus (păstrat identic)
          if (["bio2", "chim2", "adm2"].includes(code)) {
            const creditsToAdd = code === "adm2" ? 8 : 4;
            const period = new Date().toISOString().slice(0, 7);
            const doc = await StudentCredits.getOrCreate(userId, period);
            doc.included += creditsToAdd;
            await doc.save();
            console.log(`🎁 +${creditsToAdd} credite incluse pt user ${userId}`);
          }
        }

        if (session.mode === "payment") {
          if (metaPrice === PRICE_CREDIT || session.metadata?.itemType === "credit") {
            const period = new Date().toISOString().slice(0, 7);
            const doc = await StudentCredits.getOrCreate(userId, period);
            doc.extraBought += 1;
            await doc.save();
            console.log(`🎁 +1 credit extra pt user ${userId}`);
          }
        }
        break;
      }

      case "invoice.paid":
        console.log("💰 Abonament reînnoit");
        break;

      case "invoice.payment_failed":
        console.log("⚠️ Plata abonament eșuată");
        break;

      default:
        console.log(`ℹ️ Event Stripe ignorat: ${event.type}`);
    }
  } catch (err) {
    console.error("[stripe webhook handler error]", err.message);
  }

  res.status(200).send();
};

// === EXPORT ===
module.exports = { 
  router, 
  handleStripeWebhook 
};

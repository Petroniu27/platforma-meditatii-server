'// server/models/Subscription.js
const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  status: { type: String, default: "active" },
  startedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date } // poți calcula o lună de la plată
});

module.exports = mongoose.model("Subscription", SubscriptionSchema);
' | Set-Content -Encoding UTF8 .\server\models\Subscription.js


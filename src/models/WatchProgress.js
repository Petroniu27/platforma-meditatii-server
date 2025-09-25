const mongoose = require("mongoose");

const WatchProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    videoSlug: { type: String, required: true },
    lastPositionSec: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WatchProgress", WatchProgressSchema);

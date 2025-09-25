const mongoose = require("mongoose");

const CaptionSchema = new mongoose.Schema({
  lang: { type: String, required: true },
  label: { type: String, required: true }
}, { _id: false });

const VideoSchema = new mongoose.Schema({
  vimeoId: { type: String, default: null }, // ex: "987654321" (null in mock)
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  durationSec: { type: Number, default: 0 },
  moduleId: { type: String, index: true },
  captions: { type: [CaptionSchema], default: [] },
  thumbnailUrl: { type: String, default: "" },
  mock: {
    enabled: { type: Boolean, default: true },
    mp4Url: { type: String, default: "" }
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Video", VideoSchema);

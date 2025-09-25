const mongoose = require("mongoose");

const LessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug:  { type: String, required: true, unique: true },
    chapter: { type: String, required: true },
    subchapter: { type: String },
    summary: { type: String },
    isPublished: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lesson", LessonSchema);

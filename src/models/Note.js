const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema(
  {
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true, unique: true },
    content: { type: String, required: true } // HTML/Markdown/JSON
  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", NoteSchema);

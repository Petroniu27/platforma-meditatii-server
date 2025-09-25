const mongoose = require("mongoose");

const EvaluationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chapter: {
      type: String,
      required: true, // ex: "Celula", "Țesuturi", etc.
    },
    score: {
      type: Number,
      min: 1,
      max: 10,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Evaluation", EvaluationSchema);

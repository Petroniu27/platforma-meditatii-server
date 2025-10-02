const mongoose = require("mongoose");

const evaluationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    profId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      enum: ["bac_bio", "bac_romana", "bac_chimie", "adm_bio", "adm_chimie"],
      required: true,
    },
    chapterCode: {
      type: String,
      required: true, // ex: "digestie_absorbtie", "grupele_sangvine"
    },
    score: {
      type: Number,
      min: 1,
      max: 10,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Evaluation", evaluationSchema);

const mongoose = require('mongoose');

const StudentCreditsSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    period: { type: String, required: true, index: true }, // "YYYY-MM", ex: "2025-09"
    included: { type: Number, default: 0 },   // din abonament
    extraBought: { type: Number, default: 0 },// cumpărate suplimentar
    used: { type: Number, default: 0 },
  },
  { timestamps: true }
);

StudentCreditsSchema.virtual('available').get(function () {
  return Math.max(0, (this.included + this.extraBought) - this.used);
});

StudentCreditsSchema.statics.getOrCreate = async function (studentId, period, defaults = {}) {
  let doc = await this.findOne({ studentId, period });
  if (!doc) {
    doc = await this.create({ studentId, period, ...defaults });
  }
  return doc;
};

module.exports = mongoose.model('StudentCredits', StudentCreditsSchema);
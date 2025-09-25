const mongoose = require('mongoose');

const AvailabilitySchema = new mongoose.Schema(
  {
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    // Opțiunea 1: ferestre recurente (RRULE)
    rrule: { type: String, default: '' }, // ex: "FREQ=WEEKLY;BYDAY=MO,WE,FR;BYHOUR=16;BYMINUTE=0;BYSECOND=0"
    // Opțiunea 2: slot-uri fixe (start/end) – pentru excepții sau one-off
    start: { type: Date },
    end: { type: Date },
    // Zile de excepție (nu e disponibil, chiar dacă RRULE spune altceva)
    exceptions: [{ type: Date }],
    durationMin: { type: Number, default: 50, min: 15, max: 180 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index util când listăm disponibilul unui mentor într-un interval
AvailabilitySchema.index({ mentorId: 1, start: 1 });

module.exports = mongoose.model('Availability', AvailabilitySchema);
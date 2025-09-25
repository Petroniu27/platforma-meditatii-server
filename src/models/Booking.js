const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mentorId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    start:     { type: Date, required: true, index: true },
    end:       { type: Date, required: true, index: true },
    status:    { type: String, enum: ['booked','completed','no_show','canceled'], default: 'booked', index: true },
    topicId:   { type: String, default: '' }, // capitol/tema
    notes:     { type: String, default: '' },
    creditCost:{ type: Number, default: 1 },
    meetUrl:   { type: String, default: '' },
    icsText:   { type: String, default: '' },
  },
  { timestamps: true }
);

BookingSchema.index({ mentorId: 1, start: 1, end: 1 });

module.exports = mongoose.model('Booking', BookingSchema);
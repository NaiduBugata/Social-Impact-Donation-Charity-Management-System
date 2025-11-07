const mongoose = require('mongoose'); 


const anonymousTrackerSchema = new mongoose.Schema({
  anonymousId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true
  },
  qrCode: {
    type: String,
    required: true
  },
  totalDonations: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  lastDonationDate: {
    type: Date
  },
  impactScore: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

anonymousTrackerSchema.index({ email: 1 });

module.exports = mongoose.model('AnonymousTracker', anonymousTrackerSchema);
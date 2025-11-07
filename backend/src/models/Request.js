const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    userId: String,
    campaignId: String,
    category: String,
    title: String,
    description: String,
    type: { type: String, enum: ['service', 'financial'], default: 'service' },
    location: {
      lat: Number,
      lng: Number,
      address: String
    },
    status: { type: String, default: 'pending' },
    urgency: String,
  proofDocs: [String],
  sanctionedAmount: Number,
  acceptedBy: { type: String, default: null },
  acceptedAt: { type: Date },
  completed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Indexes for performance
requestSchema.index({ status: 1, createdAt: -1 });
requestSchema.index({ category: 1 });
requestSchema.index({ urgent: 1 });
requestSchema.index({ completed: 1 });
requestSchema.index({ userId: 1 });
requestSchema.index({ location: '2dsphere' }); // For geospatial queries

module.exports = mongoose.model('Request', requestSchema);
 

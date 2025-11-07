const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    category: String,
    goal: { type: Number, default: 0 },
    raised: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    createdBy: String,
    receiverId: String,
    organizationId: String,
    organizationName: String,
    location: {
      lat: Number,
      lng: Number,
      address: String
    },
    deadline: Date,
    proofImages: [String],
    verifiedProof: { type: Boolean, default: false },
    donorCount: { type: Number, default: 0 },
    status: { type: String, default: 'active' }
  },
  { timestamps: true }
);

// Indexes for performance
campaignSchema.index({ status: 1, createdAt: -1 });
campaignSchema.index({ category: 1 });
campaignSchema.index({ verified: 1 });
campaignSchema.index({ active: 1 });
campaignSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Campaign', campaignSchema);
 

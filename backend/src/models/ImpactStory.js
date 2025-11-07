const mongoose = require('mongoose');

const impactStorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  category: {
    type: String,
    required: true,
    enum: ['Education', 'Medical', 'Food', 'Shelter', 'General', 'Emergency']
  },
  summary: {
    type: String,
    required: true,
    maxlength: 500
  },
  details: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  videoUrl: {
    type: String,
    default: ''
  },
  emotionalQuote: {
    type: String,
    default: ''
  },
  beneficiaryName: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  impactMetrics: {
    peopleHelped: { type: Number, default: 0 },
    fundsUsed: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  }
}, {
  timestamps: true
});

// Index for faster queries
impactStorySchema.index({ category: 1, status: 1 });
impactStorySchema.index({ createdAt: -1 });

module.exports = mongoose.model('ImpactStory', impactStorySchema);

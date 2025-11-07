// src/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['admin', 'donor', 'helper', 'receiver'],
      default: 'donor',
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes for performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ verified: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);

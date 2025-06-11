const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weight: {
    type: Number,
    required: true,
    min: 20,
    max: 300
  },
  waterIntake: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  goal: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying by userId and createdAt
progressSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Progress', progressSchema);
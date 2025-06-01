const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  chargerInUse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChargingStation',
    default: null
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
sessionSchema.index({ userId: 1, isActive: 1 });
sessionSchema.index({ token: 1 });

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session; 
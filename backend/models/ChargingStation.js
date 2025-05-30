const mongoose = require('mongoose');

const chargingStationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'in-use', 'maintenance', 'offline'],
    default: 'available'
  },
  powerOutput: {
    type: Number,
    required: true,
    min: 0
  },
  connectorType: {
    type: String,
    required: true,
    enum: ['Type 1', 'Type 2', 'CCS', 'CHAdeMO', 'Tesla']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ChargingStation', chargingStationSchema); 
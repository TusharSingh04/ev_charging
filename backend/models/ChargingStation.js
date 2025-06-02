import mongoose from 'mongoose';

const chargingStationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(v) {
          return Array.isArray(v) && 
                 v.length === 2 && 
                 typeof v[0] === 'number' && 
                 typeof v[1] === 'number' &&
                 v[0] >= -180 && v[0] <= 180 && // longitude
                 v[1] >= -90 && v[1] <= 90;     // latitude
        },
        message: 'Invalid coordinates. Must be an array of [longitude, latitude] with valid values.'
      }
    }
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  connectorType: {
    type: String,
    required: true,
    enum: ['Type 1', 'Type 2', 'CCS', 'CHAdeMO', 'Tesla Supercharger'],
    default: 'Type 2'
  },
  powerOutput: {
    type: Number,
    required: true,
    min: 0,
    default: 50 // Default 50kW
  },
  status: {
    type: String,
    enum: ['available', 'in-use', 'maintenance', 'offline', 'active'],
    default: 'available'
  },
  pricePerKWh: {
    type: Number,
    required: true,
    min: 0,
    default: 0.35 // Default $0.35 per kWh
  },
  operatingHours: {
    open: {
      type: String,
      default: '00:00'
    },
    close: {
      type: String,
      default: '23:59'
    }
  },
  amenities: [{
    type: String,
    trim: true
  }],
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Null when not booked
  }
}, {
  timestamps: true
});

// Create geospatial index for location queries
chargingStationSchema.index({ location: '2dsphere' });

const ChargingStation = mongoose.model('ChargingStation', chargingStationSchema);

export default ChargingStation; 
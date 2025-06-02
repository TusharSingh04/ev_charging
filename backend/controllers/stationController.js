import ChargingStation from '../models/ChargingStation.js';
import mongoose from 'mongoose';

// Create new charging station
export const createStation = async (req, res) => {
  try {
    const {
      name,
      latitude,
      longitude,
      address,
      connectorType,
      powerOutput,
      pricePerKWh,
      operatingHours,
      amenities,
      status
    } = req.body;

    // Validate required fields
    if (!name || !latitude || !longitude || !address) {
      return res.status(400).json({
        error: 'Name, location (latitude/longitude), and address are required'
      });
    }

    // Parse and validate coordinates
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        error: 'Invalid latitude or longitude values'
      });
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        error: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180'
      });
    }

    // Create GeoJSON Point
    const location = {
      type: 'Point',
      coordinates: [lng, lat] // MongoDB expects [longitude, latitude]
    };

    // Create station data
    const stationData = {
      name,
      location,
      address,
      connectorType: connectorType || 'Type 2',
      powerOutput: powerOutput || 50,
      pricePerKWh: pricePerKWh || 0.35,
      status: status || 'available',
      operatingHours: operatingHours || {
        open: '00:00',
        close: '23:59'
      },
      amenities: amenities || []
    };

    // Create and save station
    const station = new ChargingStation(stationData);
    await station.save();

    res.status(201).json({
      message: 'Charging station created successfully',
      station
    });
  } catch (error) {
    console.error('Create station error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Update existing station
export const updateStation = async (req, res) => {
  try {
    console.log('Received update station request for ID:', req.params.id);
    console.log('Request body:', req.body);
    const { id } = req.params;
    const {
      name,
      latitude,
      longitude,
      address,
      connectorType,
      powerOutput,
      pricePerKWh,
      operatingHours,
      amenities,
      status
    } = req.body;

    // Find station
    const station = await ChargingStation.findById(id);
    if (!station) {
      return res.status(404).json({
        error: 'Station not found'
      });
    }

    // Prepare update data
    const updateData = {};

    // Handle location update if coordinates are provided
    if (latitude !== undefined && longitude !== undefined) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      
      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({
          error: 'Invalid latitude or longitude values'
        });
      }

      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({
          error: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180'
        });
      }

      updateData.location = {
        type: 'Point',
        coordinates: [lng, lat]
      };
    }

    // Handle other fields
    if (name) updateData.name = name;
    if (address) updateData.address = address;
    if (connectorType) updateData.connectorType = connectorType;
    if (powerOutput) updateData.powerOutput = powerOutput;
    if (pricePerKWh) updateData.pricePerKWh = pricePerKWh;
    if (status) updateData.status = status;
    if (operatingHours) updateData.operatingHours = operatingHours;
    if (amenities) updateData.amenities = amenities;

    // Update station
    const updatedStation = await ChargingStation.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Station updated successfully',
      station: updatedStation
    });
  } catch (error) {
    console.error('Update station error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Get all stations
export const getAllStations = async (req, res) => {
  try {
    const stations = await ChargingStation.find();
    res.json(stations);
  } catch (error) {
    console.error('Get stations error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Get station by ID
export const getStationById = async (req, res) => {
  try {
    const station = await ChargingStation.findById(req.params.id);
    if (!station) {
      return res.status(404).json({
        error: 'Station not found'
      });
    }
    res.json(station);
  } catch (error) {
    console.error('Get station error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Book a charging station
export const bookStation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId; // Get user ID from authenticated request

    const station = await ChargingStation.findById(id);

    if (!station) {
      return res.status(404).json({ error: 'Charging station not found' });
    }

    if (station.status !== 'available') {
      return res.status(400).json({ error: 'Charging station is not available' });
    }
    
    // Check if the user has already booked another station
    const existingBooking = await ChargingStation.findOne({ bookedBy: userId });
    if (existingBooking) {
      return res.status(400).json({ error: `You have already booked station: ${existingBooking.name}. Please release it first.` });
    }

    station.status = 'in-use';
    station.bookedBy = userId; // Associate the user with the booking
    await station.save();

    res.json({ message: 'Charging station booked successfully', station });
  } catch (error) {
    console.error('Book station error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Release a charging station
export const releaseStation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId; // Get user ID from authenticated request

    const station = await ChargingStation.findById(id);

    if (!station) {
      return res.status(404).json({ error: 'Charging station not found' });
    }

    // Check if the station is booked by the current user
    if (station.status !== 'in-use' || !station.bookedBy || station.bookedBy.toString() !== userId) {
      return res.status(400).json({ error: 'This station is not booked by you' });
    }

    station.status = 'available';
    station.bookedBy = null; // Remove user association
    await station.save();

    res.json({ message: 'Charging station released successfully', station });
  } catch (error) {
    console.error('Release station error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 
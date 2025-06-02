import express from 'express';
import { createStation, updateStation, getAllStations, getStationById, bookStation, releaseStation } from '../controllers/stationController.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';
import { ChargingStation } from '../models/ChargingStation.js';

const router = express.Router();

// Create new station (admin only)
router.post('/', verifyToken, verifyAdmin, createStation);

// Update station (admin only)
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      address,
      chargingType,
      status,
      location
    } = req.body;

    // Find station
    const station = await ChargingStation.findById(id);
    if (!station) {
      return res.status(404).json({
        error: 'Station not found'
      });
    }

    // Update station fields
    station.name = name;
    station.address = address;
    station.chargingType = chargingType;
    station.status = status;
    station.location = location;

    // Save the updated station
    const updatedStation = await station.save();

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
});

// Get all stations
router.get('/', getAllStations);

// Get station by ID
router.get('/:id', getStationById);

// Book a charging station (user only)
router.post('/:id/book', verifyToken, bookStation);

// Release a charging station (user only)
router.post('/:id/release', verifyToken, releaseStation);

export default router; 
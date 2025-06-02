import express from 'express';
import ChargingStation from '../models/ChargingStation.js';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';

const router = express.Router();

// Helper function to convert UTC date to IST
function toIST(date) {
  return new Date(date).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
}

// Create a new charging station (admin only)
router.post('/', [auth, admin], async (req, res) => {
  try {
    const chargingStation = new ChargingStation(req.body);
    await chargingStation.save();
    const obj = chargingStation.toObject();
    obj.createdAt = toIST(obj.createdAt);
    obj.updatedAt = toIST(obj.updatedAt);
    res.status(201).json(obj);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all charging stations (public)
router.get('/', async (req, res) => {
  try {
    const chargingStations = await ChargingStation.find({});
    const stationsWithIST = chargingStations.map(station => {
      const obj = station.toObject();
      obj.createdAt = toIST(obj.createdAt);
      obj.updatedAt = toIST(obj.updatedAt);
      return obj;
    });
    res.json(stationsWithIST);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific charging station (public)
router.get('/:id', async (req, res) => {
  try {
    const chargingStation = await ChargingStation.findById(req.params.id);
    if (!chargingStation) {
      return res.status(404).json({ error: 'Charging station not found' });
    }
    const obj = chargingStation.toObject();
    obj.createdAt = toIST(obj.createdAt);
    obj.updatedAt = toIST(obj.updatedAt);
    res.json(obj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a charging station (admin only)
router.patch('/:id', [auth, admin], async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'address', 'latitude', 'longitude', 'status', 'powerOutput', 'connectorType', 'pricePerKWh', 'operatingHours', 'amenities'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates' });
  }

  try {
    const chargingStation = await ChargingStation.findById(req.params.id);
    if (!chargingStation) {
      return res.status(404).json({ error: 'Charging station not found' });
    }

    updates.forEach(update => chargingStation[update] = req.body[update]);
    await chargingStation.save();
    const obj = chargingStation.toObject();
    obj.createdAt = toIST(obj.createdAt);
    obj.updatedAt = toIST(obj.updatedAt);
    res.json(obj);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a charging station (admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const chargingStation = await ChargingStation.findByIdAndDelete(req.params.id);
    if (!chargingStation) {
      return res.status(404).json({ error: 'Charging station not found' });
    }
    const obj = chargingStation.toObject();
    obj.createdAt = toIST(obj.createdAt);
    obj.updatedAt = toIST(obj.updatedAt);
    res.json(obj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Book a charging station (authenticated user)
router.post('/:id/book', auth, async (req, res) => {
  try {
    console.log(`Attempting to book station with ID: ${req.params.id}`);
    const chargingStation = await ChargingStation.findById(req.params.id);
    if (!chargingStation) {
      console.log(`Station with ID: ${req.params.id} not found.`);
      return res.status(404).json({ error: 'Charging station not found' });
    }

    if (chargingStation.status !== 'available') {
      console.log(`Station with ID: ${req.params.id} is not available. Status: ${chargingStation.status}`);
      return res.status(400).json({ error: 'Charging station is not available for booking' });
    }

    chargingStation.status = 'in-use';
    await chargingStation.save();
    console.log(`Station with ID: ${req.params.id} successfully booked.`);
    
    const obj = chargingStation.toObject();
    obj.createdAt = toIST(obj.createdAt);
    obj.updatedAt = toIST(obj.updatedAt);
    res.json(obj);
  } catch (error) {
    console.error(`Error booking station with ID: ${req.params.id}:`, error);
    res.status(400).json({ error: error.message });
  }
});

// Update charging station status (admin only)
router.put('/:id/status', [auth, admin], async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const chargingStation = await ChargingStation.findById(req.params.id);

    if (!chargingStation) {
      return res.status(404).json({ error: 'Charging station not found' });
    }

    chargingStation.status = status;
    await chargingStation.save();

    const obj = chargingStation.toObject();
    obj.createdAt = toIST(obj.createdAt);
    obj.updatedAt = toIST(obj.updatedAt);
    res.json(obj);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Release charging station after use
router.post('/:id/release', auth, async (req, res) => {
  try {
    const station = await ChargingStation.findById(req.params.id);
    if (!station) {
      return res.status(404).json({ error: 'Charging station not found' });
    }

    // Check if the station is currently in use
    if (station.status !== 'in-use') {
      return res.status(400).json({ error: 'Station is not currently in use' });
    }

    // Update station status to available
    station.status = 'available';
    station.currentUser = null;
    station.lastUsed = new Date();
    await station.save();

    const obj = station.toObject();
    obj.createdAt = toIST(obj.createdAt);
    obj.updatedAt = toIST(obj.updatedAt);
    obj.lastUsed = toIST(obj.lastUsed);
    res.json(obj);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router; 
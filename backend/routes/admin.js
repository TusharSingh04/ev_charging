import express from 'express';
import ChargingStation from '../models/ChargingStation.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// Helper function to convert UTC date to IST
function toIST(date) {
  return new Date(date).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
}

// Create a new charging station (admin only)
router.post('/stations', adminAuth, async (req, res) => {
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

// Get all charging stations (admin only)
router.get('/stations', adminAuth, async (req, res) => {
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

// Update a charging station (admin only)
router.patch('/stations/:id', adminAuth, async (req, res) => {
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
router.delete('/stations/:id', adminAuth, async (req, res) => {
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

export default router; 
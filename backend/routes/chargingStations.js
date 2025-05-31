const express = require('express');
const router = express.Router();
const ChargingStation = require('../models/ChargingStation');
const auth = require('../middleware/auth');

// Helper function to convert UTC date to IST
function toIST(date) {
  return new Date(date).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
}

// Create a new charging station
router.post('/', auth, async (req, res) => {
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

// Get all charging stations
router.get('/', auth, async (req, res) => {
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

// Get a specific charging station
router.get('/:id', auth, async (req, res) => {
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

// Update a charging station
router.patch('/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'latitude', 'longitude', 'status', 'powerOutput', 'connectorType'];
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

// Delete a charging station
router.delete('/:id', auth, async (req, res) => {
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

module.exports = router; 
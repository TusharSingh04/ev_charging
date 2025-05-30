const express = require('express');
const router = express.Router();
const ChargingStation = require('../models/ChargingStation');
const auth = require('../middleware/auth');

// Create a new charging station
router.post('/', auth, async (req, res) => {
  try {
    const chargingStation = new ChargingStation(req.body);
    await chargingStation.save();
    res.status(201).json(chargingStation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all charging stations
router.get('/', auth, async (req, res) => {
  try {
    const chargingStations = await ChargingStation.find({});
    res.json(chargingStations);
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
    res.json(chargingStation);
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
    res.json(chargingStation);
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
    res.json(chargingStation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 
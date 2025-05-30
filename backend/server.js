const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// MongoDB Connection with better options
mongoose.connect('mongodb://127.0.0.1:27017/ev_charging', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('MongoDB connected successfully');
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Routes
const authRoutes = require('./routes/auth');
const chargingStationRoutes = require('./routes/chargingStations');

app.use('/api/auth', authRoutes);
app.use('/api/charging-stations', chargingStationRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to EV Charging API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 
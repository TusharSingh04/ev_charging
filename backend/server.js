const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS,
  max: process.env.RATE_LIMIT_MAX
});
app.use(limiter);

// Logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Body Parser
app.use(bodyParser.json());
app.use(express.json());

// MongoDB Connection with better options
<<<<<<< HEAD
mongoose.connect(process.env.MONGODB_URI, {
=======
mongoose.connect('mongodb+srv://22ucs218:<db_password>@cluster0.e1mmq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
>>>>>>> 20514f70e816b8cec2680d3dfdd9bbfba0602e09
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

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message
  });
});

// Start server
const PORT = process.env.PORT;
app.listen(PORT, () => {
<<<<<<< HEAD
  console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
}); 
=======
  console.log(`Server is running on port ${PORT}`);
}); 
>>>>>>> 20514f70e816b8cec2680d3dfdd9bbfba0602e09

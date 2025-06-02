require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
  createAdminUser();
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

async function createAdminUser() {
  try {
    // Create admin user
    const adminUser = new User({
      email: 'admin@evcharging.com',
      password: 'Admin@123',
      role: 'admin'
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Email:', adminUser.email);
    console.log('Password: Admin@123');
    console.log('Role:', adminUser.role);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
} 
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { family: 4 });
    console.log('✅ MongoDB Atlas connection established.');
  } catch (err) {
    console.error('❌ DB connection error:', err.message);
    console.error('Check your MONGODB_URI in .env and your Atlas credentials.');
    process.exit(1); // Stop the app if DB connection fails
  }
};

module.exports = connectDB;

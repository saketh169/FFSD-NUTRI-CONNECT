const mongoose = require('mongoose');

const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI;
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully!\n');
  } catch (err) {
    console.error('❌ Mongo DB Connection Error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
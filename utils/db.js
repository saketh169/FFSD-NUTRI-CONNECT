const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGO_URL;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully!');
  } catch (err) {
    console.error('❌ MongoDB Connection Failed:', err.message);
    // Removed process.exit(1) to prevent serverless function crash
    // In serverless, log the error and continue; DB operations may fail
  }
};

module.exports = connectDB;
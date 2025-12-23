const mongoose = require('mongoose');

let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection) return cachedConnection; // Reuse existing connection

  const MONGODB_URI = process.env.MONGO_URL;
  if (!MONGODB_URI) {
    throw new Error('MONGO_URL environment variable is missing');
  }

  try {
    // Set bufferCommands to false for serverless to avoid hanging
    cachedConnection = await mongoose.connect(MONGODB_URI, {
        bufferCommands: false, 
    });
    console.log('✅ MongoDB Connected Successfully!');
    return cachedConnection;
  } catch (err) {
    console.error('❌ MongoDB Connection Failed:', err.message);
    throw err; 
  }
};

module.exports = connectDB;
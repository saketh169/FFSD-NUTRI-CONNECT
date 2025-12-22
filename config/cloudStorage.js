/**
 * Cloud Storage Configuration
 * 
 * For Vercel deployment, we use Cloudinary for image storage
 * This replaces disk storage which doesn't persist on serverless platforms
 * 
 * Setup Instructions:
 * 1. Sign up at https://cloudinary.com (free tier available)
 * 2. Get your Cloud Name, API Key, and API Secret from dashboard
 * 3. Add these to your Vercel environment variables:
 *    - CLOUDINARY_CLOUD_NAME
 *    - CLOUDINARY_API_KEY
 *    - CLOUDINARY_API_SECRET
 */

const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;

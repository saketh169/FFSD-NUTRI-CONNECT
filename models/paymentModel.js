const mongoose = require('mongoose');

// Subscription Schema
const subscriptionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  billingType: { type: String, enum: ['monthly', 'yearly'], required: true },
  amount: { type: Number, required: true },
  features: [{ type: String }],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User who subscribed
  paymentMethod: { type: String, required: true },
  paymentDetails: { type: mongoose.Schema.Types.Mixed },
  transactionId: { type: String, unique: true },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  active: { type: Boolean, default: true }, // Indicates if the subscription is active
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }, // Expiry date for the subscription
  updatedAt: { type: Date, default: Date.now }
});

// Export Model
module.exports = {
  Subscription: mongoose.model('Subscription', subscriptionSchema)
};
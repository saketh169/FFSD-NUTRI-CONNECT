const express = require('express');
const router = express.Router();
const {
  checkUserSubscription,
  createSubscriptionTemplate,
  processPayment,
  getSubscriptionByTransactionId,
  getAllSubscriptions,
  getSubscriptionById,
} = require('../controllers/paymentController');
const { isAuthenticated, validateSubscription, validatePayment } = require('../middlewares/paymentMiddleware');

// Check if user has an active subscription
router.get('/check-user-subscription', isAuthenticated, checkUserSubscription);

// Create a new subscription template (admin-only, assuming admin middleware would be added if needed)
router.post('/subscriptions', validateSubscription, createSubscriptionTemplate);

// Process payment and create user subscription
router.post('/payments', isAuthenticated, validatePayment, processPayment);

// Get subscription details by transactionId
router.get('/transactions/:transactionId', isAuthenticated, getSubscriptionByTransactionId);

// Get all subscriptions
router.get('/subscriptions', getAllSubscriptions);

// Get a specific subscription by ID
router.get('/subscriptions/:id', getSubscriptionById);

module.exports = router;
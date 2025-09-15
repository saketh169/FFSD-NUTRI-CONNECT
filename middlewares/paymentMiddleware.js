const mongoose = require('mongoose');

exports.isAuthenticated = (req, res, next) => {
  console.log('Session check (isAuthenticated):', req.session);
  if (!req.session.user || !req.session.user.id || !mongoose.isValidObjectId(req.session.user.id)) {
    return res.status(401).json({ error: 'Unauthorized: Please log in' });
  }
  next();
};

exports.validateSubscription = (req, res, next) => {
  const { name, billingType, amount } = req.body;
  if (!name || !billingType || !amount || !['monthly', 'yearly'].includes(billingType)) {
    return res.status(400).json({ error: 'Invalid subscription data' });
  }
  next();
};

exports.validatePayment = (req, res, next) => {
  const { subscriptionId, amount, paymentMethod, paymentDetails, name, billingType } = req.body;
  if (subscriptionId && !mongoose.isValidObjectId(subscriptionId)) {
    return res.status(400).json({ error: 'Invalid subscriptionId' });
  }
  if (!amount || !paymentMethod || !paymentDetails) {
    return res.status(400).json({ error: 'Invalid payment data' });
  }
  if (!subscriptionId && (!name || !billingType || !['monthly', 'yearly'].includes(billingType))) {
    return res.status(400).json({ error: 'Invalid subscription name or billing type' });
  }
  next();
};
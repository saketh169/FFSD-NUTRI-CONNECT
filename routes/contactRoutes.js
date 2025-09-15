const express = require('express');
const router = express.Router();
const { submitContact, getAllQueries, submitReply } = require('../controllers/contactController');
const {  ensureAdminAuthenticated } = require('../middlewares/appMiddleware');

// Contact form submission (accessible to authenticated users)
router.post('/contact', submitContact);

// Fetch all queries (admin-only)
router.get('/queries-list', ensureAdminAuthenticated, getAllQueries);

// Submit reply to a query (admin-only)
router.put('/queries-list/:id/reply', ensureAdminAuthenticated, submitReply);

module.exports = router;
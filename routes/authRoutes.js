const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { ensureAuthenticated } = require('../middlewares/appMiddleware');

// Sub-router for authentication routes
const authRouter = express.Router();

// Sign-up routes
authRouter.post('/signup/user', authController.userSignup);
authRouter.post('/signup/admin', authController.adminSignup);
authRouter.post('/signup/dietitian', authController.dietitianSignup);
authRouter.post('/signup/organization', authController.organizationSignup);

// Sign-in routes
authRouter.post('/signin/user', authController.userSignin);
authRouter.post('/signin/admin', authController.adminSignin);
authRouter.post('/signin/dietitian', authController.dietitianSignin);
authRouter.post('/signin/organization', authController.organizationSignin);

// Logout route
authRouter.post('/logout', authController.logout);

// Dashboard routes
authRouter.get('/user_dash', ensureAuthenticated, authController.userDashboard);
authRouter.get('/admin_dash', ensureAuthenticated, authController.adminDashboard);
authRouter.get('/dietitian_dash', ensureAuthenticated, authController.dietitianDashboard);
authRouter.get('/organization_dash', ensureAuthenticated, authController.organizationDashboard);

// Mount the sub-router
router.use('/', authRouter);

// Global error handler
router.use((err, req, res, next) => {
    console.error('Global error:', err.stack);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
});

module.exports = router;
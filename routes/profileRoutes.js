const express = require('express');
const {
  renderChangePassword,
  verifyPass,
  updatePass,
  renderEditProfile,
  updateProfile
} = require('../controllers/profileController');
const {
  ensureAuthenticated,
  ensureAuthorized,
  validateUser,
  validateAdmin,
  validateDietitian,
  validateOrganization
} = require('../middlewares/appMiddleware');

const router = express.Router();

// User Routes
router.get('/user_dash/change-pass', ensureAuthenticated, ensureAuthorized('user'), validateUser, (req, res) => renderChangePassword(req, res, 'user'));
router.post('/user_dash/verify-pass', ensureAuthenticated, ensureAuthorized('user'), validateUser, verifyPass);
router.post('/user_dash/update-pass', ensureAuthenticated, ensureAuthorized('user'), validateUser, updatePass);
router.get('/user_dash/edit-profile', ensureAuthenticated, ensureAuthorized('user'), validateUser, (req, res) => renderEditProfile(req, res, 'user', 'user'));
router.post('/user_dash/update-profile', ensureAuthenticated, ensureAuthorized('user'), validateUser, (req, res) => updateProfile(req, res, 'user', 'user'));

// Admin Routes
router.get('/admin_dash/change-pass', ensureAuthenticated, ensureAuthorized('admin'), validateAdmin, (req, res) => renderChangePassword(req, res, 'admin'));
router.post('/admin_dash/verify-pass', ensureAuthenticated, ensureAuthorized('admin'), validateAdmin, verifyPass);
router.post('/admin_dash/update-pass', ensureAuthenticated, ensureAuthorized('admin'), validateAdmin, updatePass);
router.get('/admin_dash/edit-profile', ensureAuthenticated, ensureAuthorized('admin'), validateAdmin, (req, res) => renderEditProfile(req, res, 'admin', 'admin'));
router.post('/admin_dash/update-profile', ensureAuthenticated, ensureAuthorized('admin'), validateAdmin, (req, res) => updateProfile(req, res, 'admin', 'admin'));

// Dietitian Routes
router.get('/dietitian_dash/change-pass', ensureAuthenticated, ensureAuthorized('dietitian'), validateDietitian, (req, res) => renderChangePassword(req, res, 'dietitian'));
router.post('/dietitian_dash/verify-pass', ensureAuthenticated, ensureAuthorized('dietitian'), validateDietitian, verifyPass);
router.post('/dietitian_dash/update-pass', ensureAuthenticated, ensureAuthorized('dietitian'), validateDietitian, updatePass);
router.get('/dietitian_dash/edit-profile', ensureAuthenticated, ensureAuthorized('dietitian'), validateDietitian, (req, res) => renderEditProfile(req, res, 'dietitian', 'dietitian'));
router.post('/dietitian_dash/update-profile', ensureAuthenticated, ensureAuthorized('dietitian'), validateDietitian, (req, res) => updateProfile(req, res, 'dietitian', 'dietitian'));

// Organization Routes
router.get('/organization_dash/change-pass', ensureAuthenticated, ensureAuthorized('organization'), validateOrganization, (req, res) => renderChangePassword(req, res, 'organization'));
router.post('/organization_dash/verify-pass', ensureAuthenticated, ensureAuthorized('organization'), validateOrganization, verifyPass);
router.post('/organization_dash/update-pass', ensureAuthenticated, ensureAuthorized('organization'), validateOrganization, updatePass);
router.get('/organization_dash/edit-profile', ensureAuthenticated, ensureAuthorized('organization'), validateOrganization, (req, res) => renderEditProfile(req, res, 'organization', 'organization'));
router.post('/organization_dash/update-profile', ensureAuthenticated, ensureAuthorized('organization'), validateOrganization, (req, res) => updateProfile(req, res, 'organization', 'organization'));

module.exports = router;
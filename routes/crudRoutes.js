const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middlewares/appMiddleware');
const {
    getUsersList,
    getDietitianList,
    getRemovedAccounts,
    deleteUser,
    deleteDietitian,
    restoreAccount,
    searchRemovedAccounts,
    searchUsers,
    searchDietitians,
    getVerifiedOrganizationsCount,
    getActiveDietPlansCount
} = require('../controllers/crudController');

// GET all active users
router.get('/users-list', ensureAuthenticated, getUsersList);

// GET all active dietitians
router.get('/dietitian-list', ensureAuthenticated, getDietitianList);

// GET all removed accounts
router.get('/removed-accounts', ensureAuthenticated, getRemovedAccounts);

// DELETE a user (soft delete)
router.delete('/users-list/:id', ensureAuthenticated, deleteUser);

// DELETE a dietitian (soft delete)
router.delete('/dietitian-list/:id', ensureAuthenticated, deleteDietitian);

// POST restore an account
router.post('/removed-accounts/:id/restore', ensureAuthenticated, restoreAccount);

// GET search removed accounts
router.get('/removed-accounts/search', ensureAuthenticated, searchRemovedAccounts);

// GET search users
router.get('/users-list/search', ensureAuthenticated, searchUsers);

// GET search dietitians
router.get('/dietitian-list/search', ensureAuthenticated, searchDietitians);

// Get count of verified organizations
router.get('/verifying-organizations', getVerifiedOrganizationsCount);

// Get count of all dietitian diet plans
router.get('/active-diet-plans', getActiveDietPlansCount);

module.exports = router;
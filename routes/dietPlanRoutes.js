const express = require('express');
const router = express.Router();
const multers = require('multer');
const { ensureUserAuthenticated, checkPlanFetchRestrictions } = require('../middlewares/appMiddleware');
const { addDietPlans, getDietPlans, fetchDietPlans } = require('../controllers/dietPlanController');

// Multer configuration for meal image uploads
const storage = multers.memoryStorage();
const upload = multers({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
}).fields([
    { name: 'mealImage0', maxCount: 1 },
    { name: 'mealImage1', maxCount: 1 },
    { name: 'mealImage2', maxCount: 1 },
    { name: 'mealImage3', maxCount: 1 },
    { name: 'mealImage4', maxCount: 1 },
    { name: 'mealImage5', maxCount: 1 },
    { name: 'mealImage6', maxCount: 1 },
    { name: 'mealImage7', maxCount: 1 },
    { name: 'mealImage8', maxCount: 1 },
    { name: 'mealImage9', maxCount: 1 }
]);

// Create new diet plan
router.post('/add-plans', upload, addDietPlans);

// Get all diet plans
router.get('/get-plans', getDietPlans);

// Fetch diet plans with restrictions
router.get('/fetch-plans', ensureUserAuthenticated, checkPlanFetchRestrictions, fetchDietPlans);

module.exports = router;
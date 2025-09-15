const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
    ensureUserAuthenticated,
    ensureAdminAuthenticated,
    ensureDietitianAuthenticated,
    ensureOrganizationAuthenticated
} = require('../middlewares/appMiddleware');
const {
    uploadUserProfileImage,
    uploadAdminProfileImage,
    uploadDietitianProfileImage,
    uploadOrganizationProfileImage
} = require('../controllers/uploadProfileController');

// Configure Multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG, PNG, and GIF images are allowed'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter: fileFilter
});

// Profile Image Upload Routes
router.post('/uploaduser', ensureUserAuthenticated, upload.single('profileImage'), uploadUserProfileImage);
router.post('/uploadadmin', ensureAdminAuthenticated, upload.single('profileImage'), uploadAdminProfileImage);
router.post('/uploaddietitian', ensureDietitianAuthenticated, upload.single('profileImage'), uploadDietitianProfileImage);
router.post('/uploadorganization', ensureOrganizationAuthenticated, upload.single('profileImage'), uploadOrganizationProfileImage);

module.exports = router;
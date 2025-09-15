const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
    ensureDietitianAuthenticated,
    ensureOrganizationAuthenticated,
    validateDietitianObjectId,
    handleMulterError
} = require('../middlewares/appMiddleware');
const {
    uploadDietitianFiles,
    getDietitians,
    getDietitianFile,
    approveDietitianDocument,
    disapproveDietitianDocument,
    finalApproveDietitian,
    finalDisapproveDietitian,
    uploadDietitianFinalReport,
    getCurrentDietitian,
    checkDietitianStatus
} = require('../controllers/verifyDietitianController');

// Multer configuration for dietitian file uploads
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF is allowed.'));
    }
};
const dietitianUpload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit per file
        files: 8 // Maximum 8 files
    }
}).fields([
    { name: 'resume', maxCount: 1 },
    { name: 'degreeCertificate', maxCount: 1 },
    { name: 'licenseDocument', maxCount: 1 },
    { name: 'idProof', maxCount: 1 },
    { name: 'experienceCertificates', maxCount: 1 },
    { name: 'specializationCertifications', maxCount: 1 },
    { name: 'internshipCertificate', maxCount: 1 },
    { name: 'researchPapers', maxCount: 1 }
]);

// Multer configuration for final report upload
const reportUpload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF is allowed.'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1 // Only one file allowed
    }
}).single('finalReport');

// Dietitian Routes
router.post('/upload', ensureDietitianAuthenticated, dietitianUpload, handleMulterError, uploadDietitianFiles);
router.get('/dietitians', ensureOrganizationAuthenticated, getDietitians);
router.get('/files/:dietitianId/:field', ensureOrganizationAuthenticated, validateDietitianObjectId, getDietitianFile);
router.post('/:dietitianId/approve', ensureOrganizationAuthenticated, validateDietitianObjectId, approveDietitianDocument);
router.post('/:dietitianId/disapprove', ensureOrganizationAuthenticated, validateDietitianObjectId, disapproveDietitianDocument);
router.post('/:dietitianId/final-approve', ensureOrganizationAuthenticated, validateDietitianObjectId, finalApproveDietitian);
router.post('/:dietitianId/final-disapprove', ensureOrganizationAuthenticated, validateDietitianObjectId, finalDisapproveDietitian);
router.post('/:dietitianId/upload-report', ensureOrganizationAuthenticated, validateDietitianObjectId, reportUpload, handleMulterError, uploadDietitianFinalReport);
router.get('/me', ensureDietitianAuthenticated, getCurrentDietitian);
router.get('/check-status', ensureDietitianAuthenticated, checkDietitianStatus);

module.exports = router;
const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
    ensureOrganizationAuthenticated,
    ensureAdminAuthenticated,
    validateOrgObjectId,
    handleMulterError
} = require('../middlewares/appMiddleware');
const {
    uploadOrganizationFiles,
    getOrganizations,
    getOrganizationFile,
    approveOrganizationDocument,
    disapproveOrganizationDocument,
    finalApproveOrganization,
    finalDisapproveOrganization,
    uploadOrganizationFinalReport,
    getCurrentOrganization,
    checkOrganizationStatus
} = require('../controllers/verifyOrganizationController');

// Multer configuration for organization file uploads
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'));
    }
};
const organizationUpload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024, // 20MB limit per file
        files: 8 // Maximum 8 files
    }
}).fields([
    { name: 'org_logo', maxCount: 1 },
    { name: 'org_brochure', maxCount: 1 },
    { name: 'legal_document', maxCount: 1 },
    { name: 'tax_document', maxCount: 1 },
    { name: 'address_proof', maxCount: 1 },
    { name: 'business_license', maxCount: 1 },
    { name: 'authorized_rep_id', maxCount: 1 },
    { name: 'bank_document', maxCount: 1 }
]);

// Multer configuration for final report upload
const reportFileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF is allowed.'));
    }
};
const reportUpload = multer({
    storage: storage,
    fileFilter: reportFileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024, // 20MB limit
        files: 1 // Only one file allowed
    }
}).single('finalReport');

// Organization Routes
router.post('/upload', ensureOrganizationAuthenticated, organizationUpload, handleMulterError, uploadOrganizationFiles);
router.get('/organizations', ensureAdminAuthenticated, getOrganizations);
router.get('/files/:orgId/:field', ensureAdminAuthenticated, validateOrgObjectId, getOrganizationFile);
router.post('/:orgId/approve', ensureAdminAuthenticated, validateOrgObjectId, approveOrganizationDocument);
router.post('/:orgId/disapprove', ensureAdminAuthenticated, validateOrgObjectId, disapproveOrganizationDocument);
router.post('/:orgId/final-approve', ensureAdminAuthenticated, validateOrgObjectId, finalApproveOrganization);
router.post('/:orgId/final-disapprove', ensureAdminAuthenticated, validateOrgObjectId, finalDisapproveOrganization);
router.post('/:orgId/upload-report', ensureAdminAuthenticated, validateOrgObjectId, reportUpload, handleMulterError, uploadOrganizationFinalReport);
router.get('/me', ensureOrganizationAuthenticated, getCurrentOrganization);
router.get('/check-status', ensureOrganizationAuthenticated, checkOrganizationStatus);

module.exports = router;
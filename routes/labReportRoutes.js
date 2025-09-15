const express = require('express');
const router = express.Router();
const multer = require('multer');
const bodyParser = require('body-parser');
const { ensureAuthorized } = require('../middlewares/appMiddleware');
const {
    submitMedicalReports,
    getUserLabReports,
    getDietitianLabReports,
    viewUserReport,
    downloadUserReport,
    viewDietitianReport,
    downloadDietitianReport,
    debugReportFields
} = require('../controllers/labReportController');

// Middleware for parsing JSON and URL-encoded data
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// Multer configuration for file uploads (storing files in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Allowed file fields (aligned with LabReport schema)
const allowedFileFields = [
    { name: 'generalHealthReport', maxCount: 1 },
    { name: 'bloodTestReport', maxCount: 1 },
    { name: 'diabetesReport', maxCount: 1 },
    { name: 'thyroidReport', maxCount: 1 },
    { name: 'bloodSugarReport', maxCount: 1 },
    { name: 'bloodPressureReport', maxCount: 1 },
    { name: 'cardiovascularReport', maxCount: 1 },
    { name: 'cardiacHealthReport', maxCount: 1 },
    { name: 'ecgReport', maxCount: 1 },
    { name: 'hormonalProfileReport', maxCount: 1 },
    { name: 'endocrineReport', maxCount: 1 }
];

// Submit medical reports
router.post('/submit-medical-reports', ensureAuthorized("user"), (req, res, next) => {
    upload.fields(allowedFileFields)(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.error('Multer Error:', err);
            return res.status(400).json({
                error: 'Unexpected field in file upload',
                details: `Field '${err.field}' is not allowed. Allowed fields: ${allowedFileFields.map(f => f.name).join(', ')}`
            });
        } else if (err) {
            console.error('Unknown Error:', err);
            return res.status(500).json({ error: 'Failed to process file upload', details: err.message });
        }
        next();
    });
}, submitMedicalReports);

// Fetch lab reports for user
router.get('/booking/lab-report/user', ensureAuthorized("user"), getUserLabReports);

// Fetch lab reports for dietitian
router.get('/booking/lab-report/dietitian', ensureAuthorized("dietitian"), getDietitianLabReports);

// View report for user
router.get('/view-report/:reportId/:fieldName', ensureAuthorized('user'), viewUserReport);

// Download report for user
router.get('/download-report/:reportId/:fieldName', ensureAuthorized('user'), downloadUserReport);

// View report for dietitian
router.get('/view-report-dietitian/:reportId/:fieldName', ensureAuthorized('dietitian'), viewDietitianReport);

// Download report for dietitian
router.get('/download-report-dietitian/:reportId/:fieldName', ensureAuthorized('dietitian'), downloadDietitianReport);

// Debug route to list available file fields
router.get('/debug-report-fields/:reportId', ensureAuthorized('user'), debugReportFields);

module.exports = router;
// routes/bookingRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const {  ensureAuthorized } = require('../middlewares/appMiddleware');
const bookingController = require('../controllers/bookingController');

// Middleware to handle multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    return res.status(400).json({ error: err.message });
  }
  next(err);
};


// // Create uploads directory if it doesn't exist
// const uploadDir = path.join(__dirname, '../Uploads');
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// Configure multer for file uploads
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit per file
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only .pdf, .jpg, .jpeg, and .png files are allowed!'));
  }
});

// Booking routes
router.get('/consultation-revenue', ensureAuthorized('admin'), bookingController.getConsultationRevenue);
router.get('/bookings/client-dietitians', ensureAuthorized('user'), bookingController.getClientDietitians);
router.get('/bookings/dietitian-clients', ensureAuthorized('dietitian'), bookingController.getDietitianClients);
router.post('/client-messages', ensureAuthorized('user'), bookingController.postClientMessages);
router.get('/client-messages', ensureAuthorized('user'), bookingController.getClientMessages);
router.post('/dietitian-messages', ensureAuthorized('dietitian'), bookingController.postDietitianMessages);
router.get('/dietitian-messages', ensureAuthorized('dietitian'), bookingController.getDietitianMessages);
router.get('/chat_user/:id', ensureAuthorized('user'), bookingController.getChatUser);
router.get('/chat_dietitian/:id', ensureAuthorized('dietitian'), bookingController.getChatDietitian);
router.get('/view-lab-reports/:userId', ensureAuthorized('dietitian'), bookingController.getViewLabReportsDietitian);
router.get('/lab-reports/:dietitianId', ensureAuthorized('user'), bookingController.getLabReportsUser);
router.get('/lab-reports-dietitian/:userId', ensureAuthorized('dietitian'), bookingController.getLabReportsDietitian);
router.get('/booking/lab-report/dietitian', ensureAuthorized('dietitian'), bookingController.getLabReportDietitianApi);
router.get('/booking/lab-report/:role', ensureAuthorized('user'), bookingController.getLabReportUserApi);
router.get('/download-report/:reportId/:fieldName', ensureAuthorized('user'), bookingController.downloadReportUser);
router.get('/download-report-dietitian/:reportId/:fieldName', ensureAuthorized('dietitian'), bookingController.downloadReportDietitian);
router.get('/submit-lab-report/:dietitianId', ensureAuthorized('user'), bookingController.getSubmitLabReport);
router.post('/submit-lab-report', ensureAuthorized('user'), upload.fields([
  { name: 'generalHealthReport', maxCount: 1 },
  { name: 'bloodTestReport', maxCount: 1 },
  { name: 'diabetesThyroidReport', maxCount: 1 },
  { name: 'bloodPressureReport', maxCount: 1 },
  { name: 'cardiacHealthReport', maxCount: 1 },
  { name: 'hormonalProfileReport', maxCount: 1 }
]), 
handleMulterError,
 bookingController.postSubmitLabReport);
router.get('/view-report-dietitian/:reportId/:fieldName', ensureAuthorized('dietitian'), bookingController.viewReportDietitian);
router.get('/view-report/:reportId/:fieldName', ensureAuthorized('user'), bookingController.viewReportUser);

module.exports = router;

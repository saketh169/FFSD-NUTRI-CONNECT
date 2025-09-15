const {User, Admin, Dietitian, Organization } = require('../models/userModel');
const mongoose = require('mongoose');
const { Subscription } = require('../models/paymentModel');

// Middleware to ensure authentication
function ensureAuthenticated(req, res, next) {
  if (req.session.user || req.session.dietitian || req.session.admin || req.session.organization) {
    next();
  } else {
    res.redirect("/roles_signin");
  }
}

// Middleware to ensure role-based authorization
function ensureAuthorized(role) {
  return (req, res, next) => {
    if (req.session.user || req.session.dietitian || req.session.admin || req.session.organization) {
      if (
        (role === "user" && req.session.user) ||
        (role === "dietitian" && req.session.dietitian) ||
        (role === "admin" && req.session.admin) ||
        (role === "organization" && req.session.organization)
      ) {
        next();
      } else {
        res.status(403).send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Unauthorized Access</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
              .unauthorized-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
              .unauthorized-content { background-color: #fff; padding: 2rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); text-align: center; max-width: 400px; width: 100%; }
              h1 { color: #dc3545; font-size: 2rem; margin-bottom: 1rem; }
              p { color: #6c757d; font-size: 1rem; margin-bottom: 2rem; }
              a { text-decoration: none; color: #fff; background-color: #007bff; padding: 0.75rem 1.5rem; border-radius: 5px; font-size: 1rem; transition: background-color 0.3s ease; }
              a:hover { background-color: #0056b3; }
            </style>
          </head>
          <body>
            <div class="unauthorized-modal">
              <div class="unauthorized-content">
                <h1>🚫 Unauthorized Access</h1>
                <p>You do not have permission to access this page.</p>
                <a href="/roles_signin">Go to Sign In</a>
              </div>
            </div>
          </body>
          </html>
        `);
      }
    } else {
      res.redirect("/roles_signin");
    }
  };
}

// Middleware to check if dietitian's final report is verified
async function ensureDietitianReportVerified(req, res, next) {
  try {
    const dietitian = await Dietitian.findById(req.session.dietitian?.id);
    if (!dietitian) {
      return res.redirect("/roles_signin");
    }

    const status = dietitian.verificationStatus.finalReport;
    if (status === "Verified") {
      return next();
    } else if (status === "Rejected") {
      return res.status(403).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Final Report Rejected</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
            .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
            .modal-content { background-color: #fff; padding: 2rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); text-align: center; max-width: 400px; width: 100%; }
            h1 { color: #dc3545; font-size: 2rem; margin-bottom: 1rem; }
            p { color: #6c757d; font-size: 1rem; margin-bottom: 2rem; }
            a { text-decoration: none; color: #fff; background-color: #007bff; padding: 0.75rem 1.5rem; border-radius: 5px; font-size: 1rem; transition: background-color 0.3s ease; }
            a:hover { background-color: #0056b3; }
          </style>
        </head>
        <body>
          <div class="modal">
            <div class="modal-content">
              <h1>🚫 Access Denied</h1>
              <p>Your final report has been rejected. Please View your Evaluation Report.</p>
              <a href="/dietitian_dash">Back to Dashboard</a>
            </div>
          </div>
        </body>
        </html>
      `);
    } else if (status === "Not Received") {
      return res.status(403).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Final Report Pending</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
            .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
            .modal-content { background-color: #fff; padding: 2rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); text-align: center; max-width: 400px; width: 100%; }
            h1 { color: #ffc107; font-size: 2rem; margin-bottom: 1rem; }
            p { color: #6c757d; font-size: 1rem; margin-bottom: 2rem; }
            a { text-decoration: none; color: #fff; background-color: #007bff; padding: 0.75rem 1.5rem; border-radius: 5px; font-size: 1rem; transition: background-color 0.3s ease; }
            a:hover { background-color: #0056b3; }
          </style>
        </head>
        <body>
          <div class="modal">
            <div class="modal-content">
              <h1>⏳ Verification Pending</h1>
              <p>Your final report is still under review. Please try again later.</p>
              <a href="/dietitian_dash">Back to Dashboard</a>
            </div>
          </div>
        </body>
        </html>
      `);
    } else {
      return res.redirect("/roles_signin");
    }
  } catch (err) {
    console.error('Error checking dietitian report status:', err);
    res.status(500).send('Server error');
  }
}

// Middleware to check if organization's final report is verified
async function ensureOrganizationReportVerified(req, res, next) {
  try {
    const organization = await Organization.findById(req.session.organization?.id);
    if (!organization) {
      return res.redirect("/roles_signin");
    }

    const status = organization.verificationStatus.finalReport;
    if (status === "Verified") {
      return next();
    } else if (status === "Rejected") {
      return res.status(403).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Final Report Rejected</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
            .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
            .modal-content { background-color: #fff; padding: 2rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); text-align: center; max-width: 400px; width: 100%; }
            h1 { color: #dc3545; font-size: 2rem; margin-bottom: 1rem; }
            p { color: #6c757d; font-size: 1rem; margin-bottom: 2rem; }
            a { text-decoration: none; color: #fff; background-color: #007bff; padding: 0.75rem 1.5rem; border-radius: 5px; font-size: 1rem; transition: background-color 0.3s ease; }
            a:hover { background-color: #0056b3; }
          </style>
        </head>
        <body>
          <div class="modal">
            <div class="modal-content">
              <h1>🚫 Access Denied</h1>
              <p>Your final report has been rejected. Please view your Evaluation Report.</p>
              <a href="/organization_dash">Back to Dashboard</a>
            </div>
          </div>
        </body>
        </html>
      `);
    } else if (status === "Not Received") {
      return res.status(403).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Final Report Pending</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
            .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
            .modal-content { background-color: #fff; padding: 2rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); text-align: center; max-width: 400px; width: 100%; }
            h1 { color: #ffc107; font-size: 2rem; margin-bottom: 1rem; }
            p { color: #6c757d; font-size: 1rem; margin-bottom: 2rem; }
            a { text-decoration: none; color: #fff; background-color: #007bff; padding: 0.75rem 1.5rem; border-radius: 5px; font-size: 1rem; transition: background-color 0.3s ease; }
            a:hover { background-color: #0056b3; }
          </style>
        </head>
        <body>
          <div class="modal">
            <div class="modal-content">
              <h1>⏳ Verification Pending</h1>
              <p>Your final report is still under review. Please try again later.</p>
              <a href="/organization_dash">Back to Dashboard</a>
            </div>
          </div>
        </body>
        </html>
      `);
    } else {
      return res.redirect("/roles_signin");
    }
  } catch (err) {
    console.error('Error checking organization report status:', err);
    res.status(500).send('Server error');
  }
}

// Middleware to validate MongoDB ObjectId for dietitian
function validateDietitianObjectId(req, res, next) {
  const { dietitianId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(dietitianId)) {
    return res.status(400).json({ success: false, message: 'Invalid dietitian ID' });
  }
  next();
}

// Middleware to validate MongoDB ObjectId for organization
function validateOrgObjectId(req, res, next) {
  const { orgId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(orgId)) {
    return res.status(400).json({ success: false, message: 'Invalid organization ID' });
  }
  next();
}

// Model for tracking plan fetches
const PlanFetchLog = mongoose.model('PlanFetchLog', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  timestamp: { type: Date, default: Date.now }
}));

// Middleware for role-based authorization
function ensureRole(role) {
  return (req, res, next) => {
    console.log(`Session check (ensureRole - ${role}):`, req.session);
    const sessionKey = role.toLowerCase();
    if (req.session[sessionKey] && mongoose.isValidObjectId(req.session[sessionKey].id)) {
      return next();
    }
    return res.status(401).json({ success: false, message: `Unauthorized: ${role} access required` });
  };
}

// Middleware for admin-only access
function ensureAdminAuthenticated(req, res, next) {
  console.log('Session check (ensureAdminAuthenticated):', req.session);
  if (req.session.admin && mongoose.isValidObjectId(req.session.admin.id)) {
    return next();
  }
  return res.status(401).json({ success: false, message: 'Unauthorized: Admin access required' });
}

// Middleware for user-only access
function ensureUserAuthenticated(req, res, next) {
  console.log('Session check (ensureUserAuthenticated):', req.session);
  if (req.session.user && mongoose.isValidObjectId(req.session.user.id)) {
    return next();
  }
  return res.status(401).json({ success: false, message: 'Unauthorized: User access required' });
}

// Middleware for dietitian-only access
function ensureDietitianAuthenticated(req, res, next) {
  console.log('Session check (ensureDietitianAuthenticated):', req.session);
  if (req.session.dietitian && mongoose.isValidObjectId(req.session.dietitian.id)) {
    return next();
  }
  return res.status(401).json({ success: false, message: 'Unauthorized: Dietitian access required' });
}

// Middleware for organization-only access
function ensureOrganizationAuthenticated(req, res, next) {
  console.log('Session check (ensureOrganizationAuthenticated):', req.session);
  if (req.session.organization && mongoose.isValidObjectId(req.session.organization.id)) {
    return next();
  }
  return res.status(401).json({ success: false, message: 'Unauthorized: Organization access required' });
}

// Middleware to check plan fetch restrictions
async function checkPlanFetchRestrictions(req, res, next) {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const userId = req.session.user.id;
    const date = req.query.date || new Date().toISOString().split('T')[0];

    let dailyFetchLimit = 3;
    let errorMessage = 'Maximum 3 plan fetches per day reached. Subscribe to a membership plan to fetch more.';
    const activeSubscription = await Subscription.findOne({
      userId,
      active: true,
      status: 'success',
      expiresAt: { $gt: new Date() }
    });

    if (activeSubscription) {
      const planName = activeSubscription.name;
      if (planName === 'Basic Plan') {
        dailyFetchLimit = 8;
        errorMessage = 'Maximum 8 plan fetches per day reached for your Basic plan. Try another day.';
      } else if (planName === 'Premium Plan') {
        dailyFetchLimit = 20;
        errorMessage = 'Maximum 20 plan fetches per day reached for your Premium plan. Try another day.';
      } else if (planName === 'Ultimate Plan') {
        dailyFetchLimit = Infinity;
        errorMessage = '';
      }
    }

    if (dailyFetchLimit !== Infinity) {
      const userFetchCount = await PlanFetchLog.countDocuments({ userId, date });
      if (userFetchCount >= dailyFetchLimit) {
        return res.status(400).json({ success: false, message: errorMessage });
      }
      await new PlanFetchLog({ userId, date }).save();
    }

    next();
  } catch (error) {
    console.error('Error checking plan fetch restrictions:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking plan fetch availability',
      error: error.message
    });
  }
}

// Middleware to validate file uploads
function validateFileUpload(req, res, next) {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ success: false, message: 'No files uploaded' });
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  for (const key in req.files) {
    const file = req.files[key][0];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ success: false, message: 'Only JPEG, PNG, and GIF images are allowed' });
    }
  }

  next();
}


// Middleware to handle Multer errors
function handleMulterError(err, req, res, next) {
    if (err instanceof multer.MulterError) {
        console.error('Multer Error:', err);
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: `Unexpected field: ${err.field}. Expected fields: resume, degreeCertificate, licenseDocument, idProof, experienceCertificates, specializationCertifications, internshipCertificate, researchPapers, finalReport, org_logo, org_brochure, legal_document, tax_document, address_proof, business_license, authorized_rep_id, bank_document`,
            });
        }
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: `File too large. Maximum size allowed is ${err.field === 'finalReport' ? '5MB' : '20MB'}.`,
            });
        }
        return res.status(400).json({
            success: false,
            message: `Multer error: ${err.message}`,
        });
    } else if (
        err.message === 'Invalid file type. Only PDF is allowed.' ||
        err.message === 'Invalid file type. Only JPEG, PNG, and PDF are allowed.'
    ) {
        console.error('File type error:', err.message);
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
    next(err);
}


// Middleware to validate entities
const validateUser = async (req, res, next) => {
  if (!req.session.user) {
    return res.status(403).json({ success: false, message: 'Unauthorized: Not a user' });
  }
  try {
    const user = await User.findById(req.session.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    req.model = User;
    req.entity = user;
    next();
  } catch (error) {
    console.error('Error validating user:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const validateAdmin = async (req, res, next) => {
  if (!req.session.admin) {
    return res.status(403).json({ success: false, message: 'Unauthorized: Not an admin' });
  }
  try {
    const admin = await Admin.findById(req.session.admin.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    req.model = Admin;
    req.entity = admin;
    next();
  } catch (error) {
    console.error('Error validating admin:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const validateDietitian = async (req, res, next) => {
  if (!req.session.dietitian) {
    return res.status(403).json({ success: false, message: 'Unauthorized: Not a dietitian' });
  }
  try {
    const dietitian = await Dietitian.findById(req.session.dietitian.id);
    if (!dietitian) {
      return res.status(404).json({ success: false, message: 'Dietitian not found' });
    }
    req.model = Dietitian;
    req.entity = dietitian;
    next();
  } catch (error) {
    console.error('Error validating dietitian:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const validateOrganization = async (req, res, next) => {
  if (!req.session.organization) {
    return res.status(403).json({ success: false, message: 'Unauthorized: Not an organization' });
  }
  try {
    const organization = await Organization.findById(req.session.organization.id);
    if (!organization) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }
    req.model = Organization;
    req.entity = organization;
    next();
  } catch (error) {
    console.error('Error validating organization:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


module.exports = {
  ensureAuthenticated,
  ensureAuthorized,
   ensureRole,


  ensureDietitianReportVerified,
  ensureOrganizationReportVerified,
  validateDietitianObjectId,
  validateOrgObjectId,
 
  ensureAdminAuthenticated,
  ensureUserAuthenticated,
  ensureDietitianAuthenticated,
  ensureOrganizationAuthenticated,

  checkPlanFetchRestrictions,
  validateFileUpload,
  handleMulterError,

  validateUser,
  validateAdmin,
  validateDietitian,
  validateOrganization
 
};
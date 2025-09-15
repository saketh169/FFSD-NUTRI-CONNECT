const express = require("express");
const path = require('path');
const router = express.Router();
const { 
  ensureAuthenticated, 
  ensureAuthorized, 
  ensureDietitianReportVerified, 
  ensureOrganizationReportVerified 
} = require('../middlewares/appMiddleware');
const appController = require('../controllers/appController');

// Define the path to the public folder
const publicPath = path.join(__dirname, '..', 'public');
router.use(express.static(publicPath));

// List of public routes
const publicRoutes = ["/", "/blog", "/contact", "/roles_signin", "/roles_signup", "/post", 
  "/submit", "/blog/:id", "/blog-submit", "/Sign_in", "/Sign_up", "/chatbot", 
  "/privacy-policy", "/terms_conditions"];

// Middleware to check if the route is public or protected
router.use((req, res, next) => {
  const isPublicRoute = publicRoutes.some(route => {
    if (route.includes(":id")) {
      return req.path.startsWith(route.split(":id")[0]);
    }
    return req.path === route;
  });

  if (isPublicRoute) {
    next();
  } else {
    ensureAuthenticated(req, res, next);
  }
});

// Public Routes
router.get("/", appController.getHome);
router.get("/chatbot", appController.getChatbot);
router.post("/chatbot/ask", appController.postChatbotAsk);
router.get("/contact", appController.getContact);
router.get("/roles_signin", appController.getRolesSignin);
router.get("/roles_signup", appController.getRolesSignup);
router.get("/Sign_in", appController.getSignIn);
router.get("/Sign_up", appController.getSignUp);
router.get("/terms_conditions", appController.getTermsConditions);
router.get("/privacy-policy", appController.getPrivacyPolicy);

// Health Specialty Routes
router.get("/weight-management", ensureAuthorized("user"), appController.getWeightManagement);
router.get("/diabetes-thyroid", ensureAuthorized("user"), appController.getDiabetesThyroid);
router.get("/cardiac-health", ensureAuthorized("user"), appController.getCardiacHealth);
router.get("/womens-health", ensureAuthorized("user"), appController.getWomensHealth);
router.get("/skin-hair", ensureAuthorized("user"), appController.getSkinHair);
router.get("/gut-health", ensureAuthorized("user"), appController.getGutHealth);

// User Routes
router.get("/user", ensureAuthorized("user"), appController.getUser);
router.get("/user-guide", ensureAuthorized("user"), appController.getUserGuide);
router.get("/user-consultations", ensureAuthorized("user"), appController.getUserConsultations);
router.get("/pricing", ensureAuthorized("user"), appController.getPricing);
router.get("/pricing_plan", ensureAuthorized("user"), appController.getPricingPlan);
router.get("/payment", ensureAuthorized("user"), appController.getPayment);
router.get("/user-schedule", ensureAuthorized("user"), appController.getUserSchedule);
router.get("/user-meal-plans", ensureAuthorized("user"), appController.getUserMealPlans);
router.get("/user-progress", ensureAuthorized("user"), appController.getUserProgress);
router.post("/user-progress", ensureAuthorized("user"), appController.postUserProgress);
router.delete("/user-progress/:id", ensureAuthorized("user"), appController.deleteUserProgress);

// Dietitian Routes
router.get("/dietitian", ensureAuthorized("dietitian"), appController.getDietitian);
router.get("/dietitian-guide", ensureAuthorized("dietitian"), appController.getDietitianGuide);
router.get("/dietitian-setup", ensureAuthorized("dietitian"), appController.getDietitianSetup);
router.get("/dietitian-consultations", ensureAuthorized("dietitian"), ensureDietitianReportVerified, appController.getDietitianConsultations);
router.get("/dietitian-schedule", ensureAuthorized("dietitian"), ensureDietitianReportVerified, appController.getDietitianSchedule);
router.get("/dietitian/today-schedule", ensureAuthorized("dietitian"), ensureDietitianReportVerified, appController.getDietitianTodaySchedule);
router.get("/dietitian-meal-plans", ensureAuthorized("dietitian"), ensureDietitianReportVerified, appController.getDietitianMealPlans);
router.get("/recieved_diet", ensureAuthorized("dietitian"), appController.getReceivedDiet);

// Admin Routes
router.get("/admin", ensureAuthorized("admin"), appController.getAdmin);
router.get("/verify_org", ensureAuthorized("admin"), appController.getVerifyOrg);
router.get("/queries", ensureAuthorized("admin"), appController.getQueries);
router.get("/users", ensureAuthorized("admin"), appController.getUsers);
router.get("/analytics", ensureAuthorized("admin"), appController.getAnalytics);

// Organization Routes
router.get("/organization", ensureAuthorized("organization"), appController.getOrganization);
router.get("/verify_diet", ensureAuthorized("organization"), ensureOrganizationReportVerified, appController.getVerifyDiet);
router.get("/recieved_org", ensureAuthorized("organization"), appController.getReceivedOrg);

// Document Routes
router.get("/doc_dietitian", ensureAuthorized("dietitian"), appController.getDocDietitian);
router.get("/doc_organization", ensureAuthorized("organization"), appController.getDocOrganization);

// 400 Error Route
router.get("/400", appController.get400Error);

module.exports = router;
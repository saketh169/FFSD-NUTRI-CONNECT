const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./utils/db'); 
require('dotenv').config({ 
  path: path.join(__dirname, 'utils', '.env') 
});

const app = express();

// Use environment variables
const PORT = process.env.PORT
const MONGODB_URI = process.env.MONGO_URL;
const NODE_ENV = process.env.NODE_ENV ;

// Generate a strong 64-byte hex session secret if not provided in .env
const generateSessionSecret = () => {
  return crypto.randomBytes(64).toString('hex');
};

const SESSION_SECRET = process.env.SESSION_SECRET || generateSessionSecret();

// Log the generated secret (remove in production)
if (!process.env.SESSION_SECRET) {
  console.log('\n🔑 Generated Session Secret:', SESSION_SECRET);
  console.log('⚠️ For production, set SESSION_SECRET in .env file instead!');
}

// Session Configuration
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    httpOnly: true,
    sameSite: 'strict'
  },
  store: MongoStore.create({
    mongoUrl: MONGODB_URI,
    ttl: 14 * 24 * 60 * 60, // 14 days
    autoRemove: 'interval',
    autoRemoveInterval: 60 // Minutes
  })
}));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
connectDB();

// Import routes
const dietitianRoutes = require('./controllers/dietitianController');
const dietitianInfoRoutes = require('./controllers/dietitianInfoController');
const authRoutes = require('./routes/authRoutes'); 
const appRoutes = require('./routes/appRoutes');
const dietitianverifyApp = require('./routes/verifydietitianRoutes');
const organizationVerifyApp = require('./routes/verifyOrganizationRoutes');
const contactRoutes = require('./routes/contactRoutes');
const dietPlanRoutes = require('./routes/dietPlanRoutes');
const labRoutes = require('./routes/labReportRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const blogRoutes = require('./routes/blogRoutes');
const crudRoutes = require('./routes/crudRoutes');
const profileRoutes = require('./routes/profileRoutes');
const uploadRoutes = require('./routes/uploadProfileRoutes');

// Use routes
app.use('/', authRoutes);
app.use('/', appRoutes);
app.use('/dietitian-doc', dietitianverifyApp);
app.use('/organization-doc', organizationVerifyApp);
app.use('/', contactRoutes);
app.use('/', dietPlanRoutes);
app.use('/', labRoutes);
app.use('/', dietitianRoutes);
app.use('/', dietitianInfoRoutes);
app.use('/', paymentRoutes);
app.use('/', bookingRoutes);
app.use('/', blogRoutes);
app.use('/', crudRoutes);
app.use('/', uploadRoutes);
app.use('/', profileRoutes);

// Display all routes
const expressListEndpoints = require('express-list-endpoints');
console.log(expressListEndpoints(app));

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).render('error', {
    message: 'Something went wrong!',
    error: err.message,
    backLink: '/',
    backLinkText: 'Go to Home'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT} in ${NODE_ENV} mode`);
});
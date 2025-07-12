require('dotenv').config({ path: './utils/.env' });
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');

const session = require('express-session');
const MongoStore = require('connect-mongo');

const connectDB = require('./utils/db'); 

const app = express();
const PORT =  4000;


// Generate a strong 64-byte hex session secret
const generateSessionSecret = () => {
  return crypto.randomBytes(64).toString('hex');
};

// Configuration
const MONGODB_URI = process.env.MONGODB_URI;
const SESSION_SECRET = process.env.SESSION_SECRET || generateSessionSecret();

// Log the generated secret (remove in production)
if (!process.env.SESSION_SECRET) {
  console.log('\n🔑 Generated Session Secret:', SESSION_SECRET);
  console.log('⚠️  For production, set SESSION_SECRET in .env file instead!');
}


// Session Configuration
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
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


// Import routes
const signupRoutes = require('./controllers/signup-route');
const signinRoutes = require('./controllers/signin-route');
const appRoutes = require('./controllers/app-route');

const dietitianApp = require('./controllers/server-diet');
const organizationApp = require('./controllers/server-org');

const editProfile = require('./controllers/edit-profile');
const changePass = require('./controllers/change-pass');
const contactRoutes = require('./controllers/contact-route');
const dietPlanRoutes = require('./controllers/dietPlan-route');
const labRoutes = require('./controllers/lab-server');

const dietitianRoutes = require('./controllers/dietitianController');
const dietitianInfoRoutes = require('./controllers/dietitianInfoController');

const paymentRoutes = require('./controllers/payment-server');
const bookingRoutes = require('./controllers/booking-route');
const blogRoutes = require('./controllers/blog-route');


const crudRoutes = require('./controllers/crud-routes');
const profileRoutes = require('./controllers/upload-routes');


// Use routes
app.use('/', signupRoutes);
app.use('/', signinRoutes);
app.use('/', appRoutes);
app.use('/', editProfile);
app.use('/', changePass);

app.use('/dietitian-doc', dietitianApp);
app.use('/organization-doc', organizationApp);

app.use('/', contactRoutes);
app.use('/', dietPlanRoutes);

app.use('/', labRoutes);
app.use('/', dietitianRoutes);
app.use('/', dietitianInfoRoutes);
app.use('/', paymentRoutes);
app.use('/', bookingRoutes);

app.use('/', blogRoutes);
app.use('/', crudRoutes);
app.use('/', profileRoutes);



// Display all routes
const expressListEndpoints = require('express-list-endpoints');
console.log(expressListEndpoints(app));


connectDB().then(() => {
  app.listen(PORT, () => {
    
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('❌ MongoDB connection failed:', err);
  process.exit(1); // Stop the app if DB connection fails
});
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const connectDB = require('./utils/db'); 
require('dotenv').config();

const app = express();

// Use environment variables
const PORT = process.env.PORT
const MONGODB_URI = process.env.MONGO_URL;
const NODE_ENV = process.env.NODE_ENV ;

// Generate a strong 64-byte hex session secret if not provided in .env
// const generateSessionSecret = () => {
//   return crypto.randomBytes(64).toString('hex');
// };

const SESSION_SECRET = process.env.SESSION_SECRET ;

// Log the generated secret (remove in production)
if (!process.env.SESSION_SECRET) {
  console.log('\n🔑 Generated Session Secret:', SESSION_SECRET);
  console.log('⚠️ For production, set SESSION_SECRET in .env file instead!');
}

// Connect to MongoDB
const startServer = async () => {
  await connectDB();

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
    client: mongoose.connection.getClient(), 
    ttl: 14 * 24 * 60 * 60
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

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Import routes
const dietitianRoutes = require('./routes/dietitianRoutes');
const dietitianInfoRoutes = require('./routes/dietitianInfoRoutes');
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
// if (NODE_ENV === 'development') {
//     const expressListEndpoints = require('express-list-endpoints');
//     console.log(expressListEndpoints(app));
// }

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


// 404 handler for API routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// Start the server

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT} in ${NODE_ENV} mode`);
});
};

startServer().catch(err => console.error('Failed to start server:', err));

module.exports = app;
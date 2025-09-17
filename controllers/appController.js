const { Question } = require('../models/chatModel');
const Blog = require('../models/blogModel');
const { BookedSlots } = require('../models/bookingModel');
const Progress = require('../models/progressModel');
const mongoose = require('mongoose');

// Home page
exports.getHome = (req, res) => {
  res.render("index");
};

// Chatbot Page
exports.getChatbot = (req, res) => {
  res.render("chatbot");
};

// Chatbot Ask Route with Keyword-Based Matching
exports.postChatbotAsk = async (req, res) => {
 let userMessage = req.body.message.toLowerCase().trim();
  // Remove punctuation from user input
  userMessage = userMessage.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?'"]/g, '');

  try {
      // Fetch all questions from the database
      const questions = await Question.find({});
      const stopWords = new Set([
          'what', 'is', 'a', 'the', 'how', 'can', 'i', 'should', 'are', 'do',
          'for', 'in', 'to', 'with', 'on', 'of', 'my', 'more', 'get', 'eat'
      ]);

      // Process user message into keywords
      const userWords = userMessage.split(/\s+/);
      const userKeywords = userWords.filter(word => !stopWords.has(word) && word.length > 2);

      if (userKeywords.length === 0) {
          return res.json({ reply: "I’m not sure about that. Try asking something like 'What is a balanced diet?'" });
      }

      // Find the best matching question based on keyword overlap
      let bestMatch = null;
      let highestScore = 0;

      for (const q of questions) {
    
          const storedQuestion = q.question.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?'"]/g, '');
          const questionWords = storedQuestion.split(/\s+/);
          const questionKeywords = questionWords.filter(word => !stopWords.has(word) && word.length > 2);

          let matchScore = 0;
          for (const userKeyword of userKeywords) {
              if (questionKeywords.includes(userKeyword)) {
                  matchScore++;
              }
          }

          // Update best match if this question has a higher score
          if (matchScore > highestScore) {
              highestScore = matchScore;
              bestMatch = q;
          }
      }

      if (bestMatch && highestScore > 0) {
          res.json({ reply: bestMatch.answer });
      } else {
          res.json({ reply: "I'm not sure about that. Try asking something like 'What is a balanced diet?'" });
      }
  } catch (err) {
      console.error('Error fetching chatbot response:', err);
      res.status(500).json({ reply: 'Sorry, something went wrong. Please try again!' });
  }
};

// Contact page
exports.getContact = (req, res) => {
  res.render("contactus");
};

// Role sign-in page
exports.getRolesSignin = (req, res) => {
  res.render("roles_signin");
};

// Role sign-up page
exports.getRolesSignup = (req, res) => {
  res.render("roles_signup");
};

// Sign-in with role
exports.getSignIn = (req, res) => {
  const role = req.query.role;
  res.render('Sign_in', { role });
};

// Sign-up with role
exports.getSignUp = (req, res) => {
  const role = req.query.role;
  res.render('Sign_up', { role });
};

// Health Specialty Routes
exports.getWeightManagement = (req, res) => {
  res.render("weight-management");
};

exports.getDiabetesThyroid = (req, res) => {
  res.render("diabetes-thyroid");
};

exports.getCardiacHealth = (req, res) => {
  res.render("cardiac-health");
};

exports.getWomensHealth = (req, res) => {
  res.render("womens-health");
};

exports.getSkinHair = (req, res) => {
  res.render("skin-hair");
};

exports.getGutHealth = (req, res) => {
  res.render("gut-health");
};

// Terms and Conditions Page
exports.getTermsConditions = (req, res) => {
  res.render("terms_conditions");
};

// Privacy Policy Page
exports.getPrivacyPolicy = (req, res) => {
  res.render("privacy-policy");
};

// User routes
exports.getUser = async (req, res) => {
  try {
    const blogs = await Blog.aggregate([
      { $match: { authorType: 'user' } },
      { $sample: { size: 3 } }
    ]);
    res.render('user', { blogs });
  } catch (error) {
    console.error('Error fetching random blogs:', error);
    res.status(500).send('Internal Server Error');
  }
};

// User Guide
exports.getUserGuide = (req, res) => {
  res.render("guide_user");
};

// User Consultations
exports.getUserConsultations = (req, res) => {
  const userId = req.session.user.id;
  console.log('Rendering consultations_user with userId:', userId);
  res.render('consultations_user', { userId });
};

// Pricing routes
exports.getPricing = (req, res) => {
  res.render("pricing");
};

exports.getPricingPlan = (req, res) => {
  res.render("pricing_plan");
};

exports.getPayment = (req, res) => {
  res.render("payment");
};

// Dietitian routes
exports.getDietitian = async (req, res) => {
  try {
    const blogs = await Blog.aggregate([
      { $match: { authorType: 'dietitian' } },
      { $sample: { size: 3 } }
    ]);
    res.render('dietitian', { blogs });
  } catch (error) {
    console.error('Error fetching random dietitian blogs:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Dietitian Guide
exports.getDietitianGuide = (req, res) => {
  res.render("guide_dietitian");
};

// Dietitian Setup
exports.getDietitianSetup = (req, res) => {
  res.render("dietitian_setup");
};

// Dietitian Consultations
exports.getDietitianConsultations = (req, res) => {
  const dietitianId = req.session.dietitian.id;
  console.log('Rendering consultations_dietitian with dietitianId:', dietitianId);
  res.render('consultations_dietitian', { dietitianId });
};

// User Schedule
exports.getUserSchedule = async (req, res) => {
  try {
    const userId = req.session.user.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const bookings = await BookedSlots.find({ 
      userId: new mongoose.Types.ObjectId(userId),
      status: 'Booked'
    })
      .populate({
        path: 'dietitianId',
        select: 'name specialization profileImage',
        match: { isDeleted: false }
      })
      .sort({ date: 1, time: 1 });

    const bookingsByDay = {};
    bookings.forEach(booking => {
      if (!booking.dietitianId) {
        console.log(`Booking ${booking._id} has no valid dietitian (dietitianId: ${booking.dietitianId})`);
        return;
      }

      const date = new Date(booking.date);
      const dayKey = date.toISOString().split('T')[0];
      
      if (!bookingsByDay[dayKey]) {
        bookingsByDay[dayKey] = [];
      }
      
      bookingsByDay[dayKey].push({
        id: booking._id,
        time: booking.time,
        date: booking.date,
        consultationType: booking.consultationType,
        dietitianName: booking.dietitianId.name || 'Unknown Dietitian',
        specialization: booking.dietitianId.specialization || 'General Nutrition',
        profileImage: booking.dietitianId.profileImage
          ? `data:image/jpeg;base64,${booking.dietitianId.profileImage.toString('base64')}`
          : null
      });
    });

    res.render("Schedule_user", { 
      bookingsByDay,
      userName: req.session.user.name || 'User'
    });
  } catch (error) {
    console.error('Error fetching user schedule:', error);
    res.status(500).send('Server error');
  }
};

// Dietitian Schedule
exports.getDietitianSchedule = async (req, res) => {
  try {
    const dietitianId = req.session.dietitian.id;
    if (!mongoose.Types.ObjectId.isValid(dietitianId)) {
      return res.status(400).json({ error: 'Invalid dietitian ID' });
    }

    const bookings = await BookedSlots.find({ 
      dietitianId: new mongoose.Types.ObjectId(dietitianId),
      status: 'Booked'
    })
      .populate({
        path: 'userId',
        select: 'name profileImage',
        match: { isDeleted: false }
      })
      .sort({ date: 1, time: 1 });

    const bookingsByDay = {};
    bookings.forEach(booking => {
      if (!booking.userId) {
        console.log(`Booking ${booking._id} has no valid user (userId: ${booking.userId})`);
        return;
      }

      const date = new Date(booking.date);
      const dayKey = date.toISOString().split('T')[0];
      
      if (!bookingsByDay[dayKey]) {
        bookingsByDay[dayKey] = [];
      }
      
      bookingsByDay[dayKey].push({
        id: booking._id,
        time: booking.time,
        date: booking.date,
        consultationType: booking.consultationType,
        clientName: booking.userId.name || 'Unknown Client',
        profileImage: booking.userId.profileImage
          ? `data:image/jpeg;base64,${booking.userId.profileImage.toString('base64')}`
          : null
      });
    });

    res.render("Schedule_dietitian", { 
      bookingsByDay,
      dietitianName: req.session.dietitian.name || 'Dietitian'
    });
  } catch (error) {
    console.error('Error fetching dietitian schedule:', error);
    res.status(500).send('Server error');
  }
};

// Dietitian Today Schedule (API)
exports.getDietitianTodaySchedule = async (req, res) => {
  try {
    const dietitianId = req.session.dietitian.id;
    if (!mongoose.Types.ObjectId.isValid(dietitianId)) {
      return res.status(400).json({ error: 'Invalid dietitian ID' });
    }

    const bookings = await BookedSlots.find({ 
      dietitianId: new mongoose.Types.ObjectId(dietitianId),
      status: 'Booked'
    })
      .populate({
        path: 'userId',
        select: 'name profileImage',
        match: { isDeleted: false }
      })
      .sort({ date: 1, time: 1 });

    const bookingsByDay = {};
    bookings.forEach(booking => {
      if (!booking.userId) {
        console.log(`Booking ${booking._id} has no valid user (userId: ${booking.userId})`);
        return;
      }

      const date = new Date(booking.date);
      const dayKey = date.toISOString().split('T')[0];
      
      if (!bookingsByDay[dayKey]) {
        bookingsByDay[dayKey] = [];
      }
      
      bookingsByDay[dayKey].push({
        id: booking._id,
        time: booking.time,
        date: booking.date,
        consultationType: booking.consultationType,
        clientName: booking.userId.name || 'Unknown Client',
        profileImage: booking.userId.profileImage
          ? `data:image/jpeg;base64,${booking.userId.profileImage.toString('base64')}`
          : null
      });
    });

    res.status(200).json({ 
      bookingsByDay,
      dietitianName: req.session.dietitian.name || 'Dietitian'
    });
  } catch (error) {
    console.error('Error fetching dietitian schedule:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Admin routes
exports.getAdmin = (req, res) => {
  res.render("admin");
};

exports.getVerifyOrg = (req, res) => {
  res.render("verify_org");
};

exports.getQueries = (req, res) => {
  res.render("Queries");
};

exports.getUsers = (req, res) => {
  res.render("users");
};

exports.getAnalytics = (req, res) => {
  res.render("analytics");
};

// Organization routes
exports.getOrganization = (req, res) => {
  res.render("organization");
};

exports.getVerifyDiet = (req, res) => {
  res.render("verify_diet");
};

exports.getReceivedOrg = (req, res) => {
  res.render("recieved_org");
};

// User Sidebar Extra Routes
exports.getUserMealPlans = (req, res) => {
  res.render("meal_user");
};

exports.getUserProgress = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const progress = await Progress.find({ userId: req.session.user.id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const totalEntries = await Progress.countDocuments({ userId: req.session.user.id });
  const totalPages = Math.ceil(totalEntries / limit);

  if (req.query.json === 'true') {
    return res.json({ progress, currentPage: page, totalPages });
  }

  res.render('user-progress', {
    progressData: progress,
    currentPage: page,
    totalPages
  });
};

exports.postUserProgress = async (req, res) => {
  const { weight, waterIntake, goal } = req.body;

  if (!weight || !waterIntake || !goal) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  if (weight < 20 || weight > 300 || waterIntake < 0 || waterIntake > 10 || goal.length > 50) {
    return res.status(400).json({ success: false, message: 'Invalid input values' });
  }

  try {
    const progress = new Progress({
      userId: req.session.user.id,
      weight,
      waterIntake,
      goal
    });
    await progress.save();

    return res.status(201).json({ success: true, message: 'Progress saved successfully', entry: progress });
  } catch (error) {
    console.error('Error saving progress:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteUserProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({ _id: req.params.id, userId: req.session.user.id });
    if (!progress) {
      return res.status(404).json({ success: false, message: 'Progress entry not found' });
    }
    await Progress.deleteOne({ _id: req.params.id });
    return res.status(200).json({ success: true, message: 'Progress entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting progress:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Dietitian Sidebar Extra Routes
exports.getDietitianMealPlans = (req, res) => {
  res.render("meal_dietitian");
};

exports.getReceivedDiet = (req, res) => {
  res.render("recieved_diet");
};

// Document Routes
exports.getDocDietitian = (req, res) => {
  res.render("doc_dietitian");
};

exports.getDocOrganization = (req, res) => {
  res.render("doc_organization");
};

// 400 Error
exports.get400Error = (req, res) => {
  res.status(400).render('400', { title: 'Bad Request | NutriConnect' });
};
// routes/blogRoutes.js
const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const router = express.Router();
const { blogAuthenticated, checkPublicRoute } = require('../middlewares/blogMiddleware');
const blogController = require('../controllers/blogController');

// Define the path to the public folder
const publicPath = path.join(__dirname, '..', 'public');
const uploadDir = path.join(publicPath, 'blog-images');

// Create the uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration for blog images
const blogImagesStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadBlogImages = multer({
  storage: blogImagesStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).array('images', 5);

// Serve static blog images
router.use("/blog-images", express.static(uploadDir));

// Apply public route middleware
router.use(checkPublicRoute);

// Blog routes
router.get("/blog", blogController.getBlog);
router.get("/post", blogAuthenticated, blogController.getPost);
router.post("/blog-submit", blogAuthenticated, uploadBlogImages, blogController.postBlogSubmit);
router.get("/blog/:id", blogAuthenticated, blogController.getSingleBlog);

module.exports = router;
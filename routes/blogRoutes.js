// routes/blogRoutes.js
const express = require("express");
const path = require("path");
const multer = require("multer");
const router = express.Router();
const { blogAuthenticated, checkPublicRoute } = require('../middlewares/blogMiddleware');
const blogController = require('../controllers/blogController');

// Multer configuration for blog images (memory storage for cloud upload)
const storage = multer.memoryStorage();

const uploadBlogImages = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).array('images', 5);

// Apply public route middleware
router.use(checkPublicRoute);

// Blog routes
router.get("/blog", blogController.getBlog);
router.get("/post", blogAuthenticated, blogController.getPost);
router.post("/blog-submit", blogAuthenticated, uploadBlogImages, blogController.postBlogSubmit);
router.get("/blog/:id", blogAuthenticated, blogController.getSingleBlog);

module.exports = router;
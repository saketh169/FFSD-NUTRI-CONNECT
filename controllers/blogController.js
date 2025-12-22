// controllers/blogController.js
const Blog = require('../models/blogModel');
const mongoose = require('mongoose');
const cloudinary = require('../config/cloudStorage');
const sanitizeHtml = require('sanitize-html');

exports.getBlog = async (req, res) => {
  try {
    const filter = req.query.filter || 'all';
    const page = parseInt(req.query.page) || 1;
    const perPage = 6;
    
    let query = {};
    if (filter !== 'all') {
      query.theme = { $regex: new RegExp(`^${filter}$`, 'i') };
    }

    const totalBlogs = await Blog.countDocuments(query);
    const totalPages = Math.ceil(totalBlogs / perPage);
    
    const blogs = await Blog.find(query)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    res.render("blog", { 
      blogs,
      currentFilter: filter,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.getPost = (req, res) => {
  res.render("post");
};

/**
 * Upload blog images to Cloudinary and create blog post
 * Supports both uploaded files and external image URLs
 */
exports.postBlogSubmit = async (req, res) => {
  try {
    const { title, content, imageUrls, theme } = req.body;

    // Validate required fields
    if (!title || !content || !theme) {
      return res.status(400).redirect("/post?error=Missing+required+fields");
    }

    // Get author information from session
    let authorType, authorId, authorName, authorEmail;
    if (req.session.user) {
      authorType = 'user';
      authorId = req.session.user.id;
      authorName = req.session.user.name;
      authorEmail = req.session.user.email;
    } else if (req.session.dietitian) {
      authorType = 'dietitian';
      authorId = req.session.dietitian.id;
      authorName = req.session.dietitian.name;
      authorEmail = req.session.dietitian.email;
    } else if (req.session.admin) {
      authorType = 'admin';
      authorId = req.session.admin.id;
      authorName = req.session.admin.name;
      authorEmail = req.session.admin.email;
    } else if (req.session.organization) {
      authorType = 'organization';
      authorId = req.session.organization.id;
      authorName = req.session.organization.name;
      authorEmail = req.session.organization.email;
    } else {
      return res.status(403).redirect("/roles_signin");
    }

    let imagePaths = [];

    // Upload files to Cloudinary if provided
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: 'nutri-connect/blogs',
                resource_type: 'auto',
                public_id: `blog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            stream.end(file.buffer);
          });
          imagePaths.push(result.secure_url);
        } catch (uploadError) {
          console.error(`Error uploading image to Cloudinary:`, uploadError);
          return res.status(500).redirect("/post?error=Image+upload+failed");
        }
      }
    }

    // Add external image URLs if provided
    if (imageUrls) {
      const urls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
      for (const url of urls) {
        try {
          new URL(url);
          imagePaths.push(url);
        } catch (err) {
          console.warn(`Invalid image URL skipped: ${url}`);
        }
      }
    }

    // Create and save blog post
    const newBlog = new Blog({
      title: sanitizeHtml(title),
      content: sanitizeHtml(content, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          img: ['src', 'alt', 'width', 'height', 'style']
        }
      }),
      images: imagePaths,
      theme,
      authorId,
      authorType,
      authorName,
      authorEmail
    });

    await newBlog.save();
    res.redirect(`/blog/${newBlog._id}`);
  } catch (error) {
    console.error("Error submitting blog:", error);
    res.status(500).redirect("/post?error=Server+error");
  }
};

exports.getSingleBlog = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).render('400', { 
        message: 'Invalid blog ID format'
      });
    }

    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).render('404', { 
        message: 'Blog not found'
      });
    }

    res.render("single-blog", { 
      blog
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).send("Internal Server Error");
  }
};
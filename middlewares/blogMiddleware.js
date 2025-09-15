// middleware/blogMiddleware.js
const publicRoutes = [
  "/", 
  "/blog", 
  "/contact", 
  "/roles_signin", 
  "/roles_signup", 
  "/submit", 
  "/Sign_in", 
  "/Sign_up", 
  "/chatbot", 
  "/privacy-policy", 
  "/terms_conditions"
];

// Middleware to ensure authentication for blog routes
function blogAuthenticated(req, res, next) {
  if (req.session.user || req.session.dietitian || req.session.admin || req.session.organization) {
    next();
  } else {
    const isBlogView = req.path.startsWith('/blog/') && req.path !== '/blog';
    const message = isBlogView 
      ? 'You need to login to view the blog'
      : 'You need to login to post the blog';

    res.status(401).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Authentication Required</title>
        <style>
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f0f2f5;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            overflow: hidden;
          }
          .alert-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease-out;
          }
          .alert-content {
            background-color: #fff;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
            text-align: center;
            max-width: 400px;
            width: 90%;
            transform: translateY(-20px);
            animation: slideIn 0.3s ease-out forwards;
          }
          h1 {
            color: #e53e3e;
            font-size: 1.8rem;
            margin-bottom: 1rem;
            font-weight: 600;
          }
          p {
            color: #4a5568;
            font-size: 1.1rem;
            margin-bottom: 2rem;
            line-height: 1.5;
          }
          .btn {
            display: inline-block;
            text-decoration: none;
            color: #fff;
            background-color: #3182ce;
            padding: 0.8rem 1.6rem;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 500;
            transition: background-color 0.2s ease, transform 0.2s ease;
          }
          .btn:hover {
            background-color: #2b6cb0;
            transform: translateY(-2px);
          }
          .btn:active {
            transform: translateY(0);
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideIn {
            from { transform: translateY(-20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @media (max-width: 480px) {
            .alert-content {
              padding: 1.5rem;
              max-width: 300px;
            }
            h1 {
              font-size: 1.5rem;
            }
            p {
              font-size: 1rem;
            }
            .btn {
              padding: 0.7rem 1.4rem;
              font-size: 0.9rem;
            }
          }
        </style>
      </head>
      <body>
        <div class="alert-modal">
          <div class="alert-content">
            <h1>🔒 Authentication Required</h1>
            <p>${message}</p>
            <a href="/roles_signin" class="btn">Sign In</a>
          </div>
        </div>
      </body>
      </html>
    `);
  }
}

// Middleware to check if the route is public or protected
function checkPublicRoute(req, res, next) {
  const isPublicRoute = publicRoutes.some(route => {
    if (route.includes(":id")) {
      return req.path.startsWith(route.split(":id")[0]);
    }
    return req.path === route;
  });

  if (isPublicRoute) {
    next();
  } else {
    blogAuthenticated(req, res, next);
  }
}

module.exports = {
  blogAuthenticated,
  checkPublicRoute
};
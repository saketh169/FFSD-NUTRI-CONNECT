# Session Persistence Fix for Vercel Production Deployment

## Problem Summary
Sessions were not persisting on Vercel because:
1. MemoryStore stores sessions in memory (not persisted)
2. Vercel serverless functions can be invoked on different instances
3. Memory is cleared between function executions

## Solution Implemented

### 1. **Database-Backed Sessions (MongoDB)**
- Replaced MemoryStore with `connect-mongo` (already in your project)
- Sessions are now persisted in MongoDB, surviving serverless invocations

### 2. **Server Configuration Changes** (server.js)

Key additions:
```javascript
app.set('trust proxy', 1); // Required for Vercel proxy headers

app.use(session({
  name: 'sessionId',
  rolling: true,          // Reset expiry on each request
  proxy: NODE_ENV === 'production', // Handle proxy headers
  cookie: {
    secure: NODE_ENV === 'production',      // HTTPS only in production
    sameSite: NODE_ENV === 'production' ? 'none' : 'lax', // Cross-site cookies
    domain: process.env.DOMAIN // Your domain in production
  },
  store: MongoStore.create({
    mongoUrl: MONGODB_URI,
    ttl: 24 * 60 * 60,    // Matches cookie maxAge
    touchAfter: 24 * 3600 // Lazy session update (don't update on every request)
  })
}));
```

### 3. **Environment Variables**

Create `.env.production` with:
```
NODE_ENV=production
PORT=3000
MONGODB_URL=your_mongodb_atlas_connection_string
SESSION_SECRET=your_strong_random_secret_here
DOMAIN=yourdomain.com
```

**Important**: Set these in Vercel Project Settings → Environment Variables:
- `MONGODB_URL` (your MongoDB Atlas connection string)
- `SESSION_SECRET` (use a strong random string)
- `DOMAIN` (your production domain)
- `NODE_ENV=production`

### 4. **Logout Functionality**

Added logout endpoint at `/logout` (POST):
```javascript
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Logout failed' });
        }
        res.clearCookie('sessionId');
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    });
};
```

## How It Works Now

1. **User Signs In** → Session data stored in MongoDB
2. **Session Cookie** → Set with secure, httpOnly, sameSite flags
3. **Subsequent Requests** → Session retrieved from MongoDB (persists across serverless invocations)
4. **Rolling Sessions** → Expiry resets on each request
5. **Logout** → Session destroyed and cookie cleared

## Verification Middleware (No Changes Needed)

Your existing middleware works perfectly now:
```javascript
const session = req.session as any;
if (!session.authenticated) {
    return res.status(401).send({ message: "Unauthorized" });
}
```

## Testing

### Local Development
```bash
npm start
# Sessions work with MongoDB
```

### Production (Vercel)
1. Push changes to your repository
2. Vercel auto-deploys
3. Verify environment variables are set in Vercel dashboard
4. Test: Sign in → Refresh page → Should stay logged in
5. Check MongoDB Atlas → New `sessions` collection created with session data

## Troubleshooting

**Sessions still not persisting?**
1. ✅ Check `MONGODB_URL` is correct in Vercel Environment Variables
2. ✅ Confirm `NODE_ENV=production` is set
3. ✅ Verify MongoDB connection is working (check Atlas logs)
4. ✅ Clear browser cookies and try again
5. ✅ Check server logs in Vercel deployment

**Cookie not being set?**
1. Ensure `secure: true` is set for HTTPS
2. Check `sameSite: 'none'` with `secure: true` for cross-site
3. Verify `domain` matches your production domain
4. Check browser console for cookie warnings

## Files Modified
- `server.js` - Session configuration with trust proxy
- `controllers/authController.js` - Added logout function
- `routes/authRoutes.js` - Added logout route
- `.env.production` - Production environment variables template

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');
const userStore = require('./services/user.store');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const feedbackRoutes = require('./routes/feedback.routes');

const app = express();
const PORT = process.env.PORT || 3030;

// CORS configuration - MUST be FIRST middleware before any body parsing
// Support multiple origins (localhost for dev, Vercel for production)
let allowedOrigins = ['http://localhost:5173']; // Default for local dev

if (process.env.FRONTEND_URL) {
  // Support comma-separated URLs - ADD to existing origins, don't replace
  const envOrigins = process.env.FRONTEND_URL.split(',').map((url) => url.trim());
  allowedOrigins = [...allowedOrigins, ...envOrigins];
}

// Always add production Vercel URL if not already present
const productionFrontend = 'https://crypto-advisor-three.vercel.app';
if (!allowedOrigins.includes(productionFrontend)) {
  allowedOrigins.push(productionFrontend);
}

// Log allowed origins
console.log('Allowed CORS origins:', allowedOrigins);

// CORS middleware - MUST be before body parsing middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, Postman, curl)
      if (!origin) {
        return callback(null, true);
      }

      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // Log for debugging in development
        if (process.env.NODE_ENV === 'development') {
          console.log('CORS: Origin not allowed:', origin);
          console.log('CORS: Allowed origins:', allowedOrigins);
        }
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Type'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// Body parsing middleware - AFTER CORS
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static images from imgs folder
app.use('/images', express.static('imgs'));

// Session configuration
app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      'cryptoadvisor-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/feedback', feedbackRoutes);

// Root route - helpful info
app.get('/', (req, res) => {
  res.json({
    message: 'CryptoAdvisor Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: {
        signup: 'POST /api/auth/signup',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        me: 'GET /api/auth/me',
      },
      users: {
        list: 'GET /api/user',
        get: 'GET /api/user/:id',
        update: 'PUT /api/user/:id',
        delete: 'DELETE /api/user/:id',
        preferences: {
          get: 'GET /api/user/preferences',
          save: 'POST /api/user/preferences',
          update: 'PUT /api/user/preferences',
        },
        feedback: {
          submit: 'POST /api/user/feedback',
          history: 'GET /api/user/feedback',
        },
      },
      dashboard: {
        get: 'GET /api/dashboard',
      },
      feedback: {
        save: 'POST /api/feedback',
        list: 'GET /api/feedback',
        stats: 'GET /api/feedback/stats',
      },
    },
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Something went wrong';
  
  // Log errors in development, but not in production (security)
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }
  
  // Add CORS headers to error responses (use same origin check as CORS middleware)
  const origin = req.headers.origin;
  if (origin) {
    // Check if origin is allowed (same logic as CORS middleware)
    const isAllowed = allowedOrigins.includes(origin);
    if (isAllowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
  }
  
  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server after MongoDB connection
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Initialize default admin user (only if no users exist)
    await userStore.initializeDefaultUser();

    // Start Express server
    app
      .listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`API available at http://localhost:${PORT}/api`);
      })
      .on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.error(`Port ${PORT} is already in use.`);
          console.error(`Please stop the other process or use a different port.`);
          console.error(`To find the process: netstat -ano | findstr :${PORT}`);
          console.error(`To kill it: taskkill /PID <PID> /F`);
        } else {
          console.error('Server error:', err);
        }
        process.exit(1);
      });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

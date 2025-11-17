require('dotenv').config();

// Debug: Check if API key is loaded (development only)
if (process.env.NODE_ENV !== 'production') {
  console.log('Environment check:');
  console.log('  CRYPTOPANIC_API_KEY:', process.env.CRYPTOPANIC_API_KEY ? 'Loaded (' + process.env.CRYPTOPANIC_API_KEY.substring(0, 10) + '...)' : 'NOT FOUND');
}

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const feedbackRoutes = require('./routes/feedback.routes');

const app = express();
const PORT = process.env.PORT || 3030;

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration - important for withCredentials: true
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL || 'http://localhost:5173'
        : 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

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
      },
      dashboard: {
        get: 'GET /api/dashboard',
      },
      feedback: {
        save: 'POST /api/feedback',
        list: 'GET /api/feedback',
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
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

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

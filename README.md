# CryptoAdvisor Backend

Express.js backend API for the CryptoAdvisor frontend application.

## Features

- ✅ Authentication endpoints (signup, login, logout)
- ✅ Session management with HttpOnly cookies
- ✅ User CRUD operations
- ✅ CORS configured for frontend integration
- ✅ Error handling middleware

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will run on `http://localhost:3030`

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Create a new user account
- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/logout` - Logout and clear session

### Users (requires authentication)

- `GET /api/user` - Get all users
- `GET /api/user/:id` - Get user by ID
- `PUT /api/user/:id` - Update user (e.g., score)
- `DELETE /api/user/:id` - Delete user

### Health Check

- `GET /api/health` - Server health check

## Environment Variables

Optional environment variables:

- `PORT` - Server port (default: 3030)
- `SESSION_SECRET` - Secret for session encryption (default: 'your-secret-key-change-in-production')
- `NODE_ENV` - Environment mode ('production' or 'development')
- `FRONTEND_URL` - Frontend URL for CORS (default: 'http://localhost:5173')

## Notes

- User data is stored in-memory (resets on server restart)
- For production, replace the in-memory store with a database (MongoDB, PostgreSQL, etc.)
- Passwords are hashed using bcryptjs
- Sessions use HttpOnly cookies for security


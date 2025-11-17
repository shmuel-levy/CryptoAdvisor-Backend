# CryptoAdvisor Backend

Express.js backend API for the CryptoAdvisor frontend application - a personalized crypto investor dashboard.

## Features

- ✅ **Authentication**: JWT-based authentication with secure password hashing
- ✅ **User Management**: Complete CRUD operations for users
- ✅ **User Preferences**: Save and retrieve user onboarding preferences
- ✅ **Dashboard Data**: Personalized dashboard with:
  - Real-time cryptocurrency prices (CoinGecko API)
  - Market news (CryptoPanic API with fallback)
  - AI-generated insights (OpenRouter API with fallback)
  - Crypto memes (local images)
- ✅ **Feedback System**: Collect user feedback for ML model training
- ✅ **MongoDB Integration**: Persistent data storage
- ✅ **Error Handling**: Comprehensive error handling with graceful degradation
- ✅ **CORS**: Configured for frontend integration

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (jsonwebtoken)
- **Password Security**: bcryptjs
- **External APIs**: CoinGecko, CryptoPanic, OpenRouter

## Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB instance)

### Installation

1. **Clone the repository**:
```bash
git clone <repository-url>
cd backend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment variables**:
Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=3030
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority

# JWT Secret (use a strong random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRES_IN=7d

# Session Secret
SESSION_SECRET=cryptoadvisor-secret-key-change-in-production

# External APIs (Optional - fallbacks available)
CRYPTOPANIC_API_KEY=your-cryptopanic-api-key
OPENROUTER_API_KEY=your-openrouter-api-key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Backend URL (for image serving)
BACKEND_URL=http://localhost:3030
```

4. **Start the server**:
```bash
npm start
```

For development:
```bash
npm run dev
```

The server will run on `http://localhost:3030`

## API Endpoints

### Authentication

- **POST** `/api/auth/signup` - Create a new user account
  - Body: `{ email, password, firstName, lastName, profileImg?, role? }`
  - Returns: `{ token, user }`

- **POST** `/api/auth/login` - Login with email and password
  - Body: `{ email, password }`
  - Returns: `{ token, user }`

- **POST** `/api/auth/logout` - Logout and clear session
  - Returns: `{ message: "Logged out successfully" }`

- **GET** `/api/auth/me` - Get current user (session-based)

### Users

- **GET** `/api/user` - Get all users (requires authentication)
- **GET** `/api/user/:id` - Get user by ID
- **PUT** `/api/user/:id` - Update user
- **DELETE** `/api/user/:id` - Delete user

### User Preferences

- **GET** `/api/user/preferences` - Get user preferences (JWT required)
  - Returns: `{ preferences }` or `{ preferences: null, completedOnboarding: false }`

- **POST** `/api/user/preferences` - Save user preferences (JWT required)
  - Body: `{ interestedAssets: string[], investorType: string, contentTypes: string[] }`
  - Returns: `{ success: true, message, preferences }`

- **PUT** `/api/user/preferences` - Update user preferences (JWT required)

### Dashboard

- **GET** `/api/dashboard` - Get personalized dashboard data (JWT required)
  - Returns: `{ user, coinPrices, marketNews, aiInsight, meme }`

### Feedback

- **POST** `/api/feedback` - Save feedback (JWT required)
  - Body: `{ type: "thumbs_up" | "thumbs_down", section: string, contentId?: string, comment?: string }`
  - Returns: `{ message, feedback }`

- **GET** `/api/feedback` - Get user's feedback history (JWT required)
  - Query params: `section?`, `limit?` (default: 50)
  - Returns: `{ feedback: [], count: number }`

- **GET** `/api/feedback/stats` - Get feedback statistics (JWT required)
  - Returns: `{ stats: { coinPrices: { thumbsUp, thumbsDown }, ... } }`

### Health Check

- **GET** `/api/health` - Server health check
- **GET** `/` - API information and available endpoints

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Tokens are returned in the response body after successful login/signup. The frontend should store this token and include it in all authenticated requests.

## Database Schema

### User Model
```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  firstName: String (required),
  lastName: String (required),
  profileImg: String,
  account: 'basic' | 'pro',
  score: Number,
  isAdmin: Boolean,
  role: 'user' | 'admin',
  preferences: {
    interestedAssets: [String],
    investorType: String,
    contentTypes: [String],
    completedOnboarding: Boolean,
    updatedAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Feedback Model
```javascript
{
  userId: ObjectId (ref: User),
  type: 'thumbs_up' | 'thumbs_down',
  section: 'coinPrices' | 'marketNews' | 'aiInsight' | 'meme',
  contentId: String (optional),
  comment: String (max 500 chars, optional),
  createdAt: Date,
  updatedAt: Date
}
```

## Error Handling

All errors follow a consistent format:
```json
{
  "message": "Error description"
}
```

Common status codes:
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not Found
- `500` - Internal Server Error

## Fallback Mechanisms

The backend includes robust fallback mechanisms for external APIs:

- **CryptoPanic News**: Falls back to realistic mock news if API is unavailable
- **AI Insights**: Falls back to template-based insights if OpenRouter API fails
- **Coin Prices**: Returns empty array if CoinGecko API fails (graceful degradation)

## Static Files

Meme images are served from the `/imgs` folder via the `/images` route:
- Access images at: `http://localhost:3030/images/<filename>`

## Development Notes

- Default admin user is created on first startup: `admin@example.com` / `admin123`
- All passwords are automatically hashed using bcrypt before saving
- JWT tokens expire after 7 days (configurable via `JWT_EXPIRES_IN`)
- Error stack traces are only shown in development mode

## Deployment

### Deployment Strategy

**Recommended Approach: Separate Frontend & Backend Deployment**

For this project, it's recommended to deploy the frontend and backend separately:

1. **Backend** → Deploy to Render/Railway/Glitch
2. **Frontend** → Deploy to Vercel/Netlify
3. **Frontend calls backend API** → Update frontend's API base URL to point to deployed backend

**Why separate deployment?**
- Better scalability (scale frontend and backend independently)
- Easier maintenance
- Standard practice for React + Express apps
- Better performance (CDN for frontend, optimized backend)

### Option 1: Separate Deployment (Recommended)

#### Deploy Backend to Render

1. **Create Render account** and connect GitHub repository
2. **Create new Web Service**:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: `Node`
3. **Add Environment Variables**:
   ```
   NODE_ENV=production
   PORT=3030
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-strong-secret-key
   SESSION_SECRET=your-session-secret
   FRONTEND_URL=https://your-frontend-url.vercel.app
   BACKEND_URL=https://your-backend.onrender.com
   CRYPTOPANIC_API_KEY=your-key
   OPENROUTER_API_KEY=your-key
   ```
4. **Deploy** → Render will build and deploy automatically

#### Deploy Frontend to Vercel

1. **Build frontend**:
   ```bash
   cd frontend
   npm run build
   ```
2. **Deploy to Vercel**:
   - Connect GitHub repository
   - Set build command: `npm run build`
   - Set output directory: `dist`
   - Add environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`
3. **Update frontend API base URL** to point to deployed backend

### Option 2: Combined Deployment (Alternative)

If you prefer to serve frontend from backend:

1. **Build frontend**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Copy dist folder to backend**:
   ```bash
   cp -r frontend/dist backend/public
   ```

3. **Update server.js** to serve static files:
   ```javascript
   // Serve React app
   app.use(express.static('public'));
   
   // API routes (must come before catch-all)
   app.use('/api', ...);
   
   // Catch-all: serve React app for all non-API routes
   app.get('*', (req, res) => {
     res.sendFile(path.join(__dirname, 'public', 'index.html'));
   });
   ```

4. **Deploy entire backend** to Render/Railway

**Note**: This approach is less flexible and not recommended for production, but works for simple deployments.

### Deployment Checklist

Before deploying:

- [x] Code is production-ready
- [ ] Set `NODE_ENV=production`
- [ ] Use a strong, random `JWT_SECRET` (minimum 32 characters)
- [ ] Use a strong, random `SESSION_SECRET`
- [ ] Configure proper `FRONTEND_URL` for CORS (deployed frontend URL)
- [ ] Set up MongoDB Atlas with proper security (IP whitelist: `0.0.0.0/0` for Render)
- [ ] Add API keys for external services (CryptoPanic, OpenRouter)
- [ ] Update frontend API base URL to deployed backend URL
- [ ] Test all endpoints on deployed backend
- [ ] Test full flow (signup → onboarding → dashboard) on deployed app

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3030
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
JWT_SECRET=generate-strong-random-string-min-32-chars
JWT_EXPIRES_IN=7d
SESSION_SECRET=generate-strong-random-string
FRONTEND_URL=https://your-frontend.vercel.app
BACKEND_URL=https://your-backend.onrender.com
CRYPTOPANIC_API_KEY=your-key
OPENROUTER_API_KEY=your-key
```

### Post-Deployment

1. **Test health endpoint**: `https://your-backend.onrender.com/api/health`
2. **Test authentication**: Signup and login
3. **Test dashboard**: Verify all sections load correctly
4. **Monitor logs**: Check for any errors in Render dashboard
5. **Update frontend**: Ensure frontend points to deployed backend URL

## Production Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production`
- [ ] Use a strong, random `JWT_SECRET` (minimum 32 characters)
- [ ] Use a strong, random `SESSION_SECRET`
- [ ] Configure proper `FRONTEND_URL` for CORS
- [ ] Set up MongoDB Atlas with proper security (IP whitelist, strong password)
- [ ] Add API keys for external services (CryptoPanic, OpenRouter)
- [ ] Remove or secure default admin user
- [ ] Set up proper logging (Winston, Morgan, etc.)
- [ ] Configure rate limiting
- [ ] Set up monitoring and error tracking

## License

ISC

const express = require('express');
const router = express.Router();
const userStore = require('../services/user.store');
const { generateToken } = require('../utils/jwt.utils');

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized' });
};

// POST /api/auth/signup
router.post('/signup', async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, profileImg, role } = req.body;

    // Debug: Log incoming request
    console.log('Signup request:', { email, hasPassword: !!password, firstName, lastName });

    // Validation
    if (!email || !password) {
      console.log('Signup validation failed: Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (!firstName || !lastName) {
      console.log('Signup validation failed: Missing firstName or lastName');
      return res.status(400).json({ message: 'First name and last name are required' });
    }

    // Check if user already exists
    const existingUser = userStore.findByEmail(email);
    if (existingUser) {
      console.log('Signup failed: User already exists', email);
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create new user
    const newUser = await userStore.create({
      email,
      password,
      firstName,
      lastName,
      profileImg: profileImg || '',
      role: role || 'user'
    });

    // Set session (for backward compatibility)
    req.session.userId = newUser._id;
    req.session.userEmail = newUser.email;

    // Generate JWT token
    const token = generateToken({
      userId: newUser._id,
      email: newUser.email,
    });

    // Return user without password and token
    const sanitizedUser = userStore.sanitizeUser(newUser);
    res.status(200).json({
      token,
      user: {
        _id: sanitizedUser._id, // Frontend expects _id
        id: sanitizedUser._id, // Also include id for compatibility
        email: sanitizedUser.email,
        name: `${sanitizedUser.firstName} ${sanitizedUser.lastName}`,
        firstName: sanitizedUser.firstName,
        lastName: sanitizedUser.lastName,
        profileImg: sanitizedUser.profileImg,
        account: sanitizedUser.account,
        score: sanitizedUser.score,
        isAdmin: sanitizedUser.isAdmin,
        role: sanitizedUser.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Debug: Log incoming request
    console.log('Login request:', { email, hasPassword: !!password });

    // Validation
    if (!email || !password) {
      console.log('Login validation failed: Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = userStore.findByEmail(email);
    if (!user) {
      console.log('Login failed: User not found', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await userStore.verifyPassword(user, password);
    if (!isValidPassword) {
      console.log('Login failed: Invalid password for', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('Login successful for', email);

    // Set session (for backward compatibility)
    req.session.userId = user._id;
    req.session.userEmail = user.email;

    // Generate JWT token
    const token = generateToken({
      userId: user._id,
      email: user.email,
    });

    // Return user without password and token
    const sanitizedUser = userStore.sanitizeUser(user);
    res.status(200).json({
      token,
      user: {
        _id: sanitizedUser._id, // Frontend expects _id
        id: sanitizedUser._id, // Also include id for compatibility
        email: sanitizedUser.email,
        name: `${sanitizedUser.firstName} ${sanitizedUser.lastName}`,
        firstName: sanitizedUser.firstName,
        lastName: sanitizedUser.lastName,
        profileImg: sanitizedUser.profileImg,
        account: sanitizedUser.account,
        score: sanitizedUser.score,
        isAdmin: sanitizedUser.isAdmin,
        role: sanitizedUser.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res, next) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      res.clearCookie('connect.sid'); // Clear the session cookie
      res.status(200).json({ message: 'Logged out successfully' });
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me - Get current user (optional, useful for checking session)
router.get('/me', requireAuth, (req, res, next) => {
  try {
    const user = userStore.findById(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    const sanitizedUser = userStore.sanitizeUser(user);
    res.status(200).json(sanitizedUser);
  } catch (error) {
    next(error);
  }
});

module.exports = router;


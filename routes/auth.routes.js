const express = require('express');
const router = express.Router();
const userStore = require('../services/user.store');
const { generateToken } = require('../utils/jwt.utils');

const { verifyTokenMiddleware } = require('../middleware/auth.middleware');

// POST /api/auth/signup
router.post('/signup', async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, profileImg, role } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (!firstName || !lastName) {
      return res.status(400).json({ message: 'First name and last name are required' });
    }

    // Check if user already exists
    const existingUser = await userStore.findByEmail(email);
    if (existingUser) {
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
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await userStore.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await userStore.verifyPassword(user, password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

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

// GET /api/auth/me - Get current user (JWT-based)
router.get('/me', verifyTokenMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await userStore.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const sanitizedUser = userStore.sanitizeUser(user);
    res.status(200).json(sanitizedUser);
  } catch (error) {
    next(error);
  }
});

module.exports = router;


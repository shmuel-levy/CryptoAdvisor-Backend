const express = require('express');
const router = express.Router();
const userStore = require('../services/user.store');
const { verifyTokenMiddleware } = require('../middleware/auth.middleware');

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized' });
};

// In-memory storage for user preferences (replace with database in production)
const userPreferences = {};

// GET /api/user - Get all users
router.get('/', requireAuth, (req, res, next) => {
  try {
    const users = userStore.getAll();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

// GET /api/user/preferences - Get user onboarding data
router.get('/preferences', verifyTokenMiddleware, (req, res, next) => {
  try {
    const userId = req.user.userId;

    const preferences = userPreferences[userId] || {
      riskTolerance: null,
      investmentGoals: [],
      experienceLevel: null,
      selectedCoins: [],
    };

    res.status(200).json(preferences);
  } catch (error) {
    next(error);
  }
});

// GET /api/user/:id - Get single user
router.get('/:id', requireAuth, (req, res, next) => {
  try {
    const { id } = req.params;
    const user = userStore.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const sanitizedUser = userStore.sanitizeUser(user);
    res.status(200).json(sanitizedUser);
  } catch (error) {
    next(error);
  }
});

// PUT /api/user/:id - Update user (e.g., score)
router.put('/:id', requireAuth, (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Only allow updating specific fields
    const allowedFields = ['_id', 'score', 'firstName', 'lastName', 'profileImg', 'account'];
    const filteredUpdates = {};
    
    for (const key of allowedFields) {
      if (updates.hasOwnProperty(key)) {
        filteredUpdates[key] = updates[key];
      }
    }

    const updatedUser = userStore.update(id, filteredUpdates);
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const sanitizedUser = userStore.sanitizeUser(updatedUser);
    res.status(200).json(sanitizedUser);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/user/:id - Delete user
router.delete('/:id', requireAuth, (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting yourself (optional safety check)
    if (req.session.userId === id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const deleted = userStore.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;


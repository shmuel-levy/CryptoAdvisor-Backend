const express = require('express');
const router = express.Router();
const userStore = require('../services/user.store');
const { verifyTokenMiddleware } = require('../middleware/auth.middleware');
const {
  validatePreferences,
} = require('../utils/preferences.validator');

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized' });
};

// GET /api/user - Get all users
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const users = await userStore.getAll();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

// GET /api/user/preferences - Get user preferences
router.get('/preferences', verifyTokenMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Get user to verify they exist
    const user = await userStore.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get preferences from user object
    const preferences = await userStore.getPreferences(userId);

    if (!preferences) {
      return res.status(200).json({
        preferences: null,
        completedOnboarding: false,
      });
    }

    res.status(200).json({
      preferences,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/user/preferences - Save user preferences
router.post('/preferences', verifyTokenMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { interestedAssets, investorType, contentTypes } = req.body;

    // Verify user exists
    const user = await userStore.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate preferences
    const validation = validatePreferences({
      interestedAssets,
      investorType,
      contentTypes,
    });

    if (!validation.isValid) {
      return res.status(400).json({
        message: `Validation error: ${validation.errors.join(', ')}`,
      });
    }

    // Save preferences
    const preferencesData = {
      interestedAssets,
      investorType,
      contentTypes,
    };

    const updatedUser = await userStore.updatePreferences(userId, preferencesData);
    if (!updatedUser) {
      return res.status(500).json({ message: 'Failed to save preferences' });
    }
    const savedPreferences = updatedUser.preferences;

    res.status(200).json({
      success: true,
      message: 'Preferences saved successfully',
      preferences: savedPreferences,
    });
  } catch (error) {
    console.error('Error saving preferences:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/user/preferences - Update user preferences
router.put('/preferences', verifyTokenMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { interestedAssets, investorType, contentTypes } = req.body;

    // Verify user exists
    const user = await userStore.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate preferences
    const validation = validatePreferences({
      interestedAssets,
      investorType,
      contentTypes,
    });

    if (!validation.isValid) {
      return res.status(400).json({
        message: `Validation error: ${validation.errors.join(', ')}`,
      });
    }

    // Update preferences
    const preferencesData = {
      interestedAssets,
      investorType,
      contentTypes,
    };

    const updatedUser = await userStore.updatePreferences(userId, preferencesData);
    if (!updatedUser) {
      return res.status(500).json({ message: 'Failed to update preferences' });
    }
    const savedPreferences = updatedUser.preferences;

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: savedPreferences,
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/user/:id - Get single user
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userStore.findById(id);
    
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
router.put('/:id', requireAuth, async (req, res, next) => {
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

    const updatedUser = await userStore.update(id, filteredUpdates);
    
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
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting yourself (optional safety check)
    if (req.session.userId === id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const deleted = await userStore.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;


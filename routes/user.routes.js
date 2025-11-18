const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const userStore = require('../services/user.store');
const { verifyTokenMiddleware } = require('../middleware/auth.middleware');
const {
  validatePreferences,
} = require('../utils/preferences.validator');
const Feedback = require('../models/Feedback');

// GET /api/user - Get all users
router.get('/', verifyTokenMiddleware, async (req, res, next) => {
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
    next(error);
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
    next(error);
  }
});

// GET /api/user/:id - Get single user
router.get('/:id', verifyTokenMiddleware, async (req, res, next) => {
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
router.put('/:id', verifyTokenMiddleware, async (req, res, next) => {
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
router.delete('/:id', verifyTokenMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    // Prevent deleting yourself (optional safety check)
    if (userId === id) {
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

// POST /api/user/feedback - Save user feedback (Frontend-compatible endpoint)
router.post('/feedback', verifyTokenMiddleware, async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const { sectionType, vote, metadata, timestamp } = req.body;

    // Validate sectionType
    const validSectionTypes = ['coinPrices', 'marketNews', 'aiInsight', 'meme'];
    if (!sectionType || !validSectionTypes.includes(sectionType)) {
      return res.status(400).json({
        message: `Invalid sectionType. Must be one of: ${validSectionTypes.join(', ')}`,
      });
    }

    // Validate vote
    if (!vote || (vote !== 'up' && vote !== 'down')) {
      return res.status(400).json({
        message: 'Invalid vote. Must be "up" or "down"',
      });
    }

    // Map frontend format to database format
    const type = vote === 'up' ? 'thumbs_up' : 'thumbs_down';
    const section = sectionType;

    // Create feedback entry
    const feedback = new Feedback({
      userId,
      type,
      section,
      contentId: metadata?.contentId || null,
      comment: metadata?.comment || null,
    });

    const savedFeedback = await feedback.save();

    // Return response in frontend-expected format
    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback: {
        id: savedFeedback._id.toString(),
        userId: savedFeedback.userId.toString(),
        sectionType: savedFeedback.section,
        vote: savedFeedback.type === 'thumbs_up' ? 'up' : 'down',
        metadata: {
          contentId: savedFeedback.contentId || null,
          comment: savedFeedback.comment || null,
        },
        createdAt: savedFeedback.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/user/feedback - Get user's feedback history (Frontend-compatible)
router.get('/feedback', verifyTokenMiddleware, async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const { sectionType, limit = 50, offset = 0 } = req.query;

    // Build query
    const query = { userId };
    if (sectionType && ['coinPrices', 'marketNews', 'aiInsight', 'meme'].includes(sectionType)) {
      query.section = sectionType;
    }

    // Fetch feedback from MongoDB
    const userFeedback = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .select('-__v');

    // Transform to frontend-expected format
    const feedback = userFeedback.map((item) => ({
      id: item._id.toString(),
      userId: item.userId.toString(),
      sectionType: item.section,
      vote: item.type === 'thumbs_up' ? 'up' : 'down',
      metadata: {
        contentId: item.contentId || null,
        comment: item.comment || null,
      },
      createdAt: item.createdAt,
    }));

    const count = await Feedback.countDocuments(query);

    res.status(200).json({
      feedback,
      count,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;


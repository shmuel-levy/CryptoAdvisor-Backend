const express = require('express');
const router = express.Router();
const { verifyTokenMiddleware } = require('../middleware/auth.middleware');
const userStore = require('../services/user.store');

// In-memory storage for user preferences (replace with database in production)
const userPreferences = {};

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

// POST /api/onboarding - Save user preferences
router.post('/', verifyTokenMiddleware, (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { riskTolerance, investmentGoals, experienceLevel, selectedCoins } =
      req.body;

    // Validate required fields
    if (!riskTolerance || !experienceLevel) {
      return res.status(400).json({
        message: 'Risk tolerance and experience level are required',
      });
    }

    // Save preferences
    userPreferences[userId] = {
      riskTolerance,
      investmentGoals: investmentGoals || [],
      experienceLevel,
      selectedCoins: selectedCoins || [],
      updatedAt: new Date().toISOString(),
    };

    res.status(200).json({
      message: 'Preferences saved successfully',
      preferences: userPreferences[userId],
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;


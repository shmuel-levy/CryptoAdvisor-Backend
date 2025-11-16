const express = require('express');
const router = express.Router();
const { verifyTokenMiddleware } = require('../middleware/auth.middleware');
const userStore = require('../services/user.store');

// GET /api/dashboard - Get dashboard data
router.get('/', verifyTokenMiddleware, (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Get user data
    const user = userStore.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Mock dashboard data (replace with actual data from your services)
    const dashboardData = {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        score: user.score,
        account: user.account,
      },
      portfolio: {
        totalValue: 0,
        coins: [],
        performance: {
          daily: 0,
          weekly: 0,
          monthly: 0,
        },
      },
      recommendations: [],
      recentActivity: [],
    };

    res.status(200).json(dashboardData);
  } catch (error) {
    next(error);
  }
});

module.exports = router;


const express = require('express');
const router = express.Router();
const { verifyTokenMiddleware } = require('../middleware/auth.middleware');
const userStore = require('../services/user.store');
const coingeckoService = require('../services/coingecko.service');

// GET /api/dashboard - Get dashboard data
router.get('/', verifyTokenMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Get user data
    const user = userStore.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user preferences to personalize dashboard
    const preferences = userStore.getPreferences(userId);
    const interestedAssets = preferences?.interestedAssets || ['BTC', 'ETH'];

    // Fetch coin prices based on user's interested assets
    const coinPricesData = await coingeckoService.getCoinPrices(
      interestedAssets
    );

    // Build dashboard data with real coin prices
    const dashboardData = {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        score: user.score,
        account: user.account,
      },
      coinPrices: {
        coins: coinPricesData.coins,
        updatedAt: new Date().toISOString(),
      },
      // Placeholder for other sections (will add in next phases)
      marketNews: { news: [], count: 0 },
      aiInsight: { insight: '', generatedAt: null },
      meme: { url: '', title: '' },
    };

    res.status(200).json(dashboardData);
  } catch (error) {
    next(error);
  }
});

module.exports = router;


const express = require('express');
const router = express.Router();
const { verifyTokenMiddleware } = require('../middleware/auth.middleware');
const userStore = require('../services/user.store');
const coingeckoService = require('../services/coingecko.service');
const cryptopanicService = require('../services/cryptopanic.service');
const aiService = require('../services/ai.service');

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

    // Fetch crypto news based on user preferences
    const contentTypes = preferences?.contentTypes || ['Market News'];
    const newsData = await cryptopanicService.getCryptoNews(
      interestedAssets,
      contentTypes
    );

    // Log if using fallback (for debugging)
    if (newsData.error) {
      console.log('Warning: Using fallback news data - CryptoPanic API may require API key');
    } else {
      console.log(`Successfully fetched ${newsData.count} news articles`);
    }

    // Generate AI insight based on user preferences
    const aiInsightData = await aiService.generateInsight({
      interestedAssets,
      investorType: preferences?.investorType || 'HODLer',
      contentTypes,
    });

    // Log AI insight generation
    if (aiInsightData.error) {
      console.log('Warning: Using fallback AI insight');
    } else {
      console.log(`Successfully generated AI insight using ${aiInsightData.model}`);
    }

    // Build dashboard data with real coin prices, news, and AI insight
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
      marketNews: {
        news: newsData.news,
        count: newsData.count,
        updatedAt: new Date().toISOString(),
      },
      aiInsight: {
        insight: aiInsightData.insight,
        generatedAt: aiInsightData.generatedAt,
        model: aiInsightData.model,
      },
      // Placeholder for other sections (will add in next phases)
      meme: { url: '', title: '' },
    };

    res.status(200).json(dashboardData);
  } catch (error) {
    next(error);
  }
});

module.exports = router;


const axios = require('axios');

/**
 * CryptoPanic API Service
 * Fetches cryptocurrency news and market updates
 * Free tier available - May need API key for higher limits
 */

const CRYPTOPANIC_API_BASE = 'https://cryptopanic.com/api/v1';

/**
 * Get crypto news based on user preferences
 * @param {string[]} currencies - Array of currency symbols (e.g., ['BTC', 'ETH'])
 * @param {string[]} contentTypes - User's preferred content types
 * @returns {Promise<Object>} News data
 */
async function getCryptoNews(currencies = [], contentTypes = []) {
  try {
    // CryptoPanic uses currency codes
    const currencyMap = {
      BTC: 'BTC',
      ETH: 'ETH',
      SOL: 'SOL',
      ADA: 'ADA',
      DOT: 'DOT',
      MATIC: 'MATIC',
      AVAX: 'AVAX',
      BNB: 'BNB',
      XRP: 'XRP',
    };

    // Convert to comma-separated currency codes
    const currencyCodes = currencies
      .map((symbol) => currencyMap[symbol.toUpperCase()])
      .filter(Boolean)
      .join(',');

    // Build API URL
    // Note: Free tier may require API key - check cryptopanic.com
    const params = {
      auth_token: process.env.CRYPTOPANIC_API_KEY || '', // Optional API key
      currencies: currencyCodes || 'BTC,ETH', // Default to BTC,ETH if none
      public: true, // Only public posts
      filter: 'hot', // 'hot', 'rising', or 'bullish'
    };

    const response = await axios.get(`${CRYPTOPANIC_API_BASE}/posts/`, {
      params,
    });

    // Transform and filter news based on content types
    let news = response.data.results || [];

    // Limit to 10 most recent articles
    news = news.slice(0, 10).map((article) => ({
      id: article.id,
      title: article.title,
      url: article.url,
      source: article.source?.title || 'CryptoPanic',
      publishedAt: article.published_at,
      votes: article.votes?.positive || 0,
      currencies: article.currencies || [],
    }));

    return { news, count: news.length };
  } catch (error) {
    console.error('Error fetching CryptoPanic news:', error.message);
    // Return fallback news on error
    return {
      news: [
        {
          id: 'fallback-1',
          title: 'Crypto Market Update',
          url: 'https://cryptopanic.com',
          source: 'CryptoPanic',
          publishedAt: new Date().toISOString(),
          votes: 0,
          currencies: [],
        },
      ],
      count: 1,
      error: 'Using fallback news data',
    };
  }
}

module.exports = {
  getCryptoNews,
};


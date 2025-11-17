const axios = require('axios');

/**
 * CoinGecko API Service
 * Fetches cryptocurrency prices and market data
 * Free API - No key required for basic calls
 */

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

/**
 * Get coin prices for user's interested assets
 * @param {string[]} coinIds - Array of coin IDs (e.g., ['bitcoin', 'ethereum'])
 * @returns {Promise<Object>} Coin prices data
 */
async function getCoinPrices(coinIds) {
  try {
    // CoinGecko uses coin IDs, not symbols
    // Map common symbols to CoinGecko IDs
    const coinIdMap = {
      BTC: 'bitcoin',
      ETH: 'ethereum',
      SOL: 'solana',
      ADA: 'cardano',
      DOT: 'polkadot',
      MATIC: 'matic-network',
      AVAX: 'avalanche-2',
      BNB: 'binancecoin',
      XRP: 'ripple',
    };

    // Convert symbols to CoinGecko IDs
    const ids = coinIds
      .map((symbol) => coinIdMap[symbol.toUpperCase()])
      .filter(Boolean) // Remove undefined values
      .join(',');

    if (!ids) {
      return { coins: [] };
    }

    // Fetch prices from CoinGecko
    const response = await axios.get(
      `${COINGECKO_API_BASE}/simple/price`,
      {
        params: {
          ids: ids,
          vs_currencies: 'usd',
          include_24hr_change: true,
          include_7d_change: true,
        },
      }
    );

    // Transform data to a more usable format
    const coins = Object.entries(response.data).map(([id, data]) => {
      // Get symbol from ID (reverse lookup)
      const symbol = Object.keys(coinIdMap).find(
        (key) => coinIdMap[key] === id
      );

      return {
        id,
        symbol: symbol || id,
        price: data.usd,
        change24h: data.usd_24h_change || 0,
        change7d: data.usd_7d_change || 0,
      };
    });

    return { coins };
  } catch (error) {
    console.error('Error fetching CoinGecko data:', error.message);
    // Return empty data on error (graceful degradation)
    return { coins: [], error: 'Failed to fetch coin prices' };
  }
}

/**
 * Get trending coins (optional - for recommendations)
 */
async function getTrendingCoins() {
  try {
    const response = await axios.get(
      `${COINGECKO_API_BASE}/search/trending`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching trending coins:', error.message);
    return { coins: [] };
  }
}

module.exports = {
  getCoinPrices,
  getTrendingCoins,
};


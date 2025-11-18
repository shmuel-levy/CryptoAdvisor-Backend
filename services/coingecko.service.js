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
    // Note: MATIC (Polygon) changed ID from 'matic-network' to 'matic-network' or 'polygon'
    const coinIdMap = {
      BTC: 'bitcoin',
      ETH: 'ethereum',
      SOL: 'solana',
      ADA: 'cardano',
      DOT: 'polkadot',
      MATIC: 'polygon', // Updated: CoinGecko changed MATIC ID
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

    // Fetch prices from CoinGecko with timeout
    const response = await axios.get(
      `${COINGECKO_API_BASE}/simple/price`,
      {
        params: {
          ids: ids,
          vs_currencies: 'usd',
          include_24hr_change: true,
          include_7d_change: true,
        },
        timeout: 10000, // 10 second timeout
      }
    );

    // Check if response has valid data
    if (!response.data || typeof response.data !== 'object') {
      console.error('CoinGecko API: Invalid response data format');
      return { coins: [], error: 'Invalid API response' };
    }

    // Transform data to a more usable format
    const coins = Object.entries(response.data)
      .map(([id, data]) => {
        // Validate data structure - check if usd exists and is a number
        if (!data || (typeof data.usd !== 'number' && data.usd !== undefined)) {
          // Log more details for debugging
          console.warn(`CoinGecko API: Invalid data for ${id}:`, JSON.stringify(data));
          return null;
        }

        // Handle case where usd might be undefined (shouldn't happen, but just in case)
        if (data.usd === undefined) {
          console.warn(`CoinGecko API: Missing USD price for ${id}`);
          return null;
        }

        // Get symbol from ID (reverse lookup)
        const symbol = Object.keys(coinIdMap).find(
          (key) => coinIdMap[key] === id
        );

        return {
          id,
          symbol: symbol || id.toUpperCase(),
          price: data.usd,
          change24h: data.usd_24h_change || 0,
          change7d: data.usd_7d_change || 0,
        };
      })
      .filter(Boolean); // Remove null values

    if (coins.length === 0) {
      console.warn('CoinGecko API: No valid coins returned');
      return { coins: [], error: 'No coin data available' };
    }

    return { coins };
  } catch (error) {
    // Detailed error logging for debugging
    if (error.response) {
      // API responded with error status
      console.error('CoinGecko API Error:', error.response.status, error.response.data);
      if (error.response.status === 429) {
        return { coins: [], error: 'Rate limit exceeded. Please try again later.' };
      }
    } else if (error.request) {
      // Request made but no response
      console.error('CoinGecko API Request Error:', error.message);
      return { coins: [], error: 'Network error. Please check your connection.' };
    } else {
      // Error setting up request
      console.error('CoinGecko API Error:', error.message);
    }
    
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
    return { coins: [] };
  }
}

module.exports = {
  getCoinPrices,
  getTrendingCoins,
};


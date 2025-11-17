/**
 * Meme Service
 * Provides crypto memes for the dashboard
 * 
 * Strategy: Using curated static meme URLs for reliability
 * Alternative: Reddit API (r/cryptomemes, r/cryptocurrencymemes)
 *              or Meme API services
 * 
 * Note: In production, consider:
 * - Reddit API integration (requires OAuth)
 * - Meme database with user-uploaded content
 * - External meme APIs
 */

// Curated crypto meme collection
// Using local images from /imgs folder
// Images are served via Express static middleware at /images route

const CRYPTO_MEMES = [
  {
    id: 'meme-1',
    filename: 'bitcoin-memes-2024.png',
    url: '/images/bitcoin-memes-2024.png',
    title: 'Bitcoin Memes 2024',
    description: 'Classic Bitcoin humor',
    source: 'CryptoAdvisor',
    tags: ['BTC', 'HODL', 'meme'],
  },
  {
    id: 'meme-2',
    filename: 'should I sell bitcoin.png',
    url: '/images/should I sell bitcoin.png',
    title: 'Should I Sell Bitcoin?',
    description: 'The eternal question',
    source: 'CryptoAdvisor',
    tags: ['BTC', 'HODL', 'dip'],
  },
  {
    id: 'meme-3',
    filename: 'alt coins are pumping.png',
    url: '/images/alt coins are pumping.png',
    title: 'Alt Coins Are Pumping',
    description: 'When alts go up',
    source: 'CryptoAdvisor',
    tags: ['altcoins', 'bullish', 'pump'],
  },
  {
    id: 'meme-4',
    filename: 'john-wick-vs-john-weak-crypto-meme.png',
    url: '/images/john-wick-vs-john-weak-crypto-meme.png',
    title: 'John Wick vs John Weak',
    description: 'Diamond hands vs paper hands',
    source: 'CryptoAdvisor',
    tags: ['diamond-hands', 'HODL', 'meme'],
  },
  {
    id: 'meme-5',
    filename: 'remember all of that money we saved for the house.jpeg',
    url: '/images/remember all of that money we saved for the house.jpeg',
    title: 'Remember All That Money',
    description: 'Crypto life decisions',
    source: 'CryptoAdvisor',
    tags: ['lifestyle', 'crypto', 'decisions'],
  },
  {
    id: 'meme-6',
    filename: 'trading crypto.jpg',
    url: '/images/trading crypto.jpg',
    title: 'Trading Crypto',
    description: 'The trading life',
    source: 'CryptoAdvisor',
    tags: ['trading', 'crypto', 'day-trader'],
  },
  {
    id: 'meme-7',
    filename: 'unnamed.png',
    url: '/images/unnamed.png',
    title: 'Crypto Meme',
    description: 'Random crypto humor',
    source: 'CryptoAdvisor',
    tags: ['meme', 'crypto', 'fun'],
  },
  {
    id: 'meme-8',
    filename: 'unnamed (1).png',
    url: '/images/unnamed (1).png',
    title: 'Crypto Meme 2',
    description: 'More crypto humor',
    source: 'CryptoAdvisor',
    tags: ['meme', 'crypto', 'fun'],
  },
];

/**
 * Get a random crypto meme
 * Returns a different meme each time for variety
 * 
 * @param {string[]} userInterestedAssets - Optional: filter memes by user's coins
 * @param {string} baseUrl - Optional: base URL for image paths (default: relative path)
 * @returns {Object} Random meme object with url, title, and metadata
 */
function getRandomMeme(userInterestedAssets = [], baseUrl = '') {
  // Filter memes by user's interested assets if provided
  let availableMemes = CRYPTO_MEMES;
  
  if (userInterestedAssets && userInterestedAssets.length > 0) {
    // Try to find memes that match user's coins
    const assetTags = userInterestedAssets.map(asset => asset.toUpperCase());
    const matchingMemes = CRYPTO_MEMES.filter(meme => 
      meme.tags.some(tag => assetTags.includes(tag))
    );
    
    // Use matching memes if found, otherwise use all memes
    if (matchingMemes.length > 0) {
      availableMemes = matchingMemes;
    }
  }
  
  // Select random meme
  const randomIndex = Math.floor(Math.random() * availableMemes.length);
  const selectedMeme = availableMemes[randomIndex];
  
  // Build full URL if baseUrl provided, otherwise use relative path
  const imageUrl = baseUrl 
    ? `${baseUrl}${selectedMeme.url}` 
    : selectedMeme.url;
  
  return {
    url: imageUrl,
    title: selectedMeme.title,
    description: selectedMeme.description,
    source: selectedMeme.source,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Get all memes (for future use - admin panel, meme gallery, etc.)
 * @returns {Array} All available memes
 */
function getAllMemes() {
  return CRYPTO_MEMES.map(meme => ({
    ...meme,
    fetchedAt: new Date().toISOString(),
  }));
}

/**
 * Get meme by ID (for future use)
 * @param {string} memeId - Meme ID
 * @returns {Object|null} Meme object or null if not found
 */
function getMemeById(memeId) {
  const meme = CRYPTO_MEMES.find(m => m.id === memeId);
  if (!meme) return null;
  
  return {
    ...meme,
    fetchedAt: new Date().toISOString(),
  };
}

module.exports = {
  getRandomMeme,
  getAllMemes,
  getMemeById,
};


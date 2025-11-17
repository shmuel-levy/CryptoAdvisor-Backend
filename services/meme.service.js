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
// Using Unsplash CDN for reliable production-ready images
// 
// To replace with actual crypto memes later:
// 1. Host your own images on a CDN (Cloudinary, AWS S3, etc.)
// 2. Use Reddit API to fetch from r/cryptomemes
// 3. Use Imgur direct image links (i.imgur.com/...)
// 4. Use a meme API service
//
// Current URLs use Unsplash - reliable, fast, works everywhere (including Render/Netlify)
const CRYPTO_MEMES = [
  {
    id: 'meme-1',
    url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&h=400&fit=crop',
    title: 'HODL Strong',
    description: 'Diamond hands never fold',
    source: 'CryptoAdvisor',
    tags: ['HODL', 'BTC'],
  },
  {
    id: 'meme-2',
    url: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=600&h=400&fit=crop',
    title: 'To The Moon',
    description: 'When your portfolio goes up',
    source: 'CryptoAdvisor',
    tags: ['moon', 'bullish'],
  },
  {
    id: 'meme-3',
    url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=400&fit=crop',
    title: 'When Bitcoin Dips',
    description: 'Stay calm and HODL',
    source: 'CryptoAdvisor',
    tags: ['dip', 'BTC', 'HODL'],
  },
  {
    id: 'meme-4',
    url: 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720e?w=600&h=400&fit=crop',
    title: 'Diamond Hands',
    description: 'Never selling',
    source: 'CryptoAdvisor',
    tags: ['diamond-hands', 'HODL'],
  },
  {
    id: 'meme-5',
    url: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=600&h=400&fit=crop',
    title: 'Crypto Life',
    description: 'Living the crypto dream',
    source: 'CryptoAdvisor',
    tags: ['lifestyle', 'crypto'],
  },
  {
    id: 'meme-6',
    url: 'https://images.unsplash.com/photo-1621416893542-0e9d0ad80c49?w=600&h=400&fit=crop',
    title: 'Buy The Dip',
    description: 'Best time to accumulate',
    source: 'CryptoAdvisor',
    tags: ['buy', 'dip', 'accumulate'],
  },
  {
    id: 'meme-7',
    url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&h=400&fit=crop&auto=format',
    title: 'When You See Green',
    description: 'Portfolio in the green',
    source: 'CryptoAdvisor',
    tags: ['green', 'profit', 'bullish'],
  },
  {
    id: 'meme-8',
    url: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=600&h=400&fit=crop&auto=format',
    title: 'ETH To The Moon',
    description: 'Ethereum going up',
    source: 'CryptoAdvisor',
    tags: ['ETH', 'moon', 'ethereum'],
  },
];

/**
 * Get a random crypto meme
 * Returns a different meme each time for variety
 * 
 * @param {string[]} userInterestedAssets - Optional: filter memes by user's coins
 * @returns {Object} Random meme object with url, title, and metadata
 */
function getRandomMeme(userInterestedAssets = []) {
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
  
  return {
    url: selectedMeme.url,
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


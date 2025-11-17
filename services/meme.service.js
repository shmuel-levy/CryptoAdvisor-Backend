/**
 * Meme Service
 * Provides crypto memes - using static JSON for simplicity
 * Alternative: Scrape Reddit r/cryptomemes or use Reddit API
 */

// Static meme database
// In production, you could fetch from Reddit API or a meme database
const CRYPTO_MEMES = [
  {
    id: 'meme-1',
    url: 'https://i.redd.it/cryptomeme1.jpg',
    title: 'HODL Strong',
    source: 'Reddit',
  },
  {
    id: 'meme-2',
    url: 'https://i.redd.it/cryptomeme2.jpg',
    title: 'When Bitcoin Dips',
    source: 'Reddit',
  },
  {
    id: 'meme-3',
    url: 'https://i.redd.it/cryptomeme3.jpg',
    title: 'Diamond Hands',
    source: 'Reddit',
  },
  {
    id: 'meme-4',
    url: 'https://i.redd.it/cryptomeme4.jpg',
    title: 'To the Moon',
    source: 'Reddit',
  },
  {
    id: 'meme-5',
    url: 'https://i.redd.it/cryptomeme5.jpg',
    title: 'Crypto Life',
    source: 'Reddit',
  },
  // Add more meme URLs here
  // You can use actual Reddit image URLs or host your own
];

/**
 * Get a random crypto meme
 * @returns {Object} Random meme object
 */
function getRandomMeme() {
  const randomIndex = Math.floor(Math.random() * CRYPTO_MEMES.length);
  return {
    ...CRYPTO_MEMES[randomIndex],
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Get all memes (for future use)
 */
function getAllMemes() {
  return CRYPTO_MEMES;
}

module.exports = {
  getRandomMeme,
  getAllMemes,
};


/**
 * Validation utility for user preferences
 */

const VALID_INVESTOR_TYPES = [
  'HODLer',
  'Day Trader',
  'NFT Collector',
  'DeFi Enthusiast',
  'Swing Trader',
];

const VALID_CONTENT_TYPES = [
  'Market News',
  'Charts',
  'Social',
  'Fun',
  'Technical Analysis',
  'Memes',
];

/**
 * Validate user preferences
 * @param {Object} preferences - Preferences object to validate
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
function validatePreferences(preferences) {
  const errors = [];

  // Validate interestedAssets
  if (!preferences.interestedAssets) {
    errors.push('interestedAssets is required');
  } else if (!Array.isArray(preferences.interestedAssets)) {
    errors.push('interestedAssets must be an array');
  } else if (preferences.interestedAssets.length === 0) {
    errors.push('interestedAssets must contain at least 1 item');
  } else if (preferences.interestedAssets.length > 10) {
    errors.push('interestedAssets must contain at most 10 items');
  }

  // Validate investorType
  if (!preferences.investorType) {
    errors.push('investorType is required');
  } else if (typeof preferences.investorType !== 'string') {
    errors.push('investorType must be a string');
  } else if (!VALID_INVESTOR_TYPES.includes(preferences.investorType)) {
    errors.push(
      `investorType must be one of: ${VALID_INVESTOR_TYPES.join(', ')}`
    );
  }

  // Validate contentTypes
  if (!preferences.contentTypes) {
    errors.push('contentTypes is required');
  } else if (!Array.isArray(preferences.contentTypes)) {
    errors.push('contentTypes must be an array');
  } else if (preferences.contentTypes.length === 0) {
    errors.push('contentTypes must contain at least 1 item');
  } else if (preferences.contentTypes.length > 6) {
    errors.push('contentTypes must contain at most 6 items');
  } else {
    // Validate each content type
    const invalidTypes = preferences.contentTypes.filter(
      (type) => !VALID_CONTENT_TYPES.includes(type)
    );
    if (invalidTypes.length > 0) {
      errors.push(
        `Invalid contentTypes: ${invalidTypes.join(', ')}. Valid options: ${VALID_CONTENT_TYPES.join(', ')}`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validatePreferences,
  VALID_INVESTOR_TYPES,
  VALID_CONTENT_TYPES,
};


const User = require('../models/User');

/**
 * User Store - MongoDB Implementation
 * All methods now use MongoDB via Mongoose
 */

// Initialize with a default admin user for testing (only if no users exist)
async function initializeDefaultUser() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const adminUser = new User({
        email: 'admin@example.com',
        password: 'admin123', // Will be hashed by pre-save hook
        firstName: 'Admin',
        lastName: 'User',
        profileImg: '',
        account: 'pro',
        score: 10000,
        isAdmin: true,
        role: 'admin',
      });
      await adminUser.save();
      console.log('Default admin user created: admin@example.com / admin123');
    }
  } catch (error) {
    // Only log error, don't throw (allows server to start even if DB not connected)
    console.error('Error initializing default user:', error.message);
  }
}

// User store methods
const userStore = {
  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null
   */
  async findByEmail(email) {
    try {
      return await User.findOne({ email: email.toLowerCase() });
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  },

  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object|null>} User object or null
   */
  async findById(id) {
    try {
      return await User.findById(id);
    } catch (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }
  },

  /**
   * Get all users (without passwords - handled by toJSON in model)
   * @returns {Promise<Array>} Array of user objects
   */
  async getAll() {
    try {
      return await User.find({}).select('-password');
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  },

  /**
   * Create new user
   * Password will be automatically hashed by pre-save hook
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user object
   */
  async create(userData) {
    try {
      const newUser = new User({
        email: userData.email.toLowerCase(),
        password: userData.password, // Will be hashed automatically
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        profileImg: userData.profileImg || '',
        account: 'basic',
        score: 0,
        isAdmin: false,
        role: userData.role || 'user',
      });

      const savedUser = await newUser.save();
      return savedUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  /**
   * Update user
   * @param {string} id - User ID
   * @param {Object} updates - Update data
   * @returns {Promise<Object|null>} Updated user or null
   */
  async update(id, updates) {
    try {
      // If password is being updated, it will be hashed by pre-save hook
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      );
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  },

  /**
   * Update user preferences
   * @param {string} userId - User ID
   * @param {Object} preferences - Preferences data
   * @returns {Promise<Object|null>} Updated user or null
   */
  async updatePreferences(userId, preferences) {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            'preferences.interestedAssets': preferences.interestedAssets,
            'preferences.investorType': preferences.investorType,
            'preferences.contentTypes': preferences.contentTypes,
            'preferences.completedOnboarding': true,
            'preferences.updatedAt': new Date(),
          },
        },
        { new: true }
      );
      return updatedUser;
    } catch (error) {
      console.error('Error updating preferences:', error);
      return null;
    }
  },

  /**
   * Get user preferences
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} Preferences object or null
   */
  async getPreferences(userId) {
    try {
      const user = await User.findById(userId).select('preferences');
      if (!user) return null;
      
      // Return null if preferences are empty/default
      if (!user.preferences || !user.preferences.completedOnboarding) {
        return null;
      }
      
      return user.preferences;
    } catch (error) {
      console.error('Error getting preferences:', error);
      return null;
    }
  },

  /**
   * Delete user
   * @param {string} id - User ID
   * @returns {Promise<boolean>} True if deleted, false otherwise
   */
  async delete(id) {
    try {
      const result = await User.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  },

  /**
   * Verify password
   * @param {Object} user - User object from database
   * @param {string} password - Plain text password
   * @returns {Promise<boolean>} True if password matches
   */
  async verifyPassword(user, password) {
    try {
      return await user.comparePassword(password);
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  },

  /**
   * Get user without password
   * Note: User model's toJSON already removes password, but keeping for compatibility
   * @param {Object} user - User object
   * @returns {Object} User object without password
   */
  sanitizeUser(user) {
    if (!user) return null;
    // User model's toJSON already handles this, but we'll ensure it
    const userObj = user.toObject ? user.toObject() : user;
    delete userObj.password;
    return userObj;
  },
};

// Initialize default user when module loads (only if MongoDB is connected)
// We'll call this from server.js after DB connection
if (require.main === module) {
  // Only run if this file is executed directly (for testing)
  initializeDefaultUser();
}

// Export initialization function for server.js
userStore.initializeDefaultUser = initializeDefaultUser;

module.exports = userStore;


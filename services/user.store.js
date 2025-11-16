const bcrypt = require('bcryptjs');

// In-memory user store
// In production, replace this with a database (MongoDB, PostgreSQL, etc.)
const users = [];

// Helper function to generate a simple ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Initialize with a default admin user for testing
async function initializeDefaultUser() {
  if (users.length === 0) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    users.push({
      _id: 'admin-' + generateId(),
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      profileImg: '',
      password: hashedPassword,
      account: 'pro',
      score: 10000,
      isAdmin: true,
      role: 'admin'
    });
    console.log('✅ Default admin user created: admin@example.com / admin123');
  }
}

// User store methods
const userStore = {
  // Find user by email
  findByEmail(email) {
    return users.find(user => user.email === email);
  },

  // Find user by ID
  findById(id) {
    return users.find(user => user._id === id);
  },

  // Get all users (without passwords)
  getAll() {
    return users.map(({ password, ...user }) => user);
  },

  // Create new user
  async create(userData) {
    const { password, ...rest } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = {
      _id: generateId(),
      email: userData.email,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      profileImg: userData.profileImg || '',
      password: hashedPassword,
      account: 'basic',
      score: 0,
      isAdmin: false,
      role: userData.role || 'user',
      ...rest
    };

    users.push(newUser);
    return newUser;
  },

  // Update user
  update(id, updates) {
    const userIndex = users.findIndex(user => user._id === id);
    if (userIndex === -1) return null;

    const { password, ...rest } = updates;
    const updatedUser = { ...users[userIndex], ...rest };
    
    if (password) {
      // Hash new password if provided
      bcrypt.hash(password, 10).then(hashed => {
        updatedUser.password = hashed;
      });
    }

    users[userIndex] = updatedUser;
    return updatedUser;
  },

  // Delete user
  delete(id) {
    const userIndex = users.findIndex(user => user._id === id);
    if (userIndex === -1) return false;
    users.splice(userIndex, 1);
    return true;
  },

  // Verify password
  async verifyPassword(user, password) {
    return await bcrypt.compare(password, user.password);
  },

  // Get user without password
  sanitizeUser(user) {
    if (!user) return null;
    const { password, ...sanitized } = user;
    return sanitized;
  }
};

// Initialize default user on module load
initializeDefaultUser();

module.exports = userStore;


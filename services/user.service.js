// In-memory user store
// In production, replace this with a database (MongoDB, PostgreSQL, etc.)

let users = [];
let nextId = 1;

// Helper to generate unique ID
const generateId = () => {
  return String(nextId++);
};

export const userService = {
  // Create a new user
  async create(userData) {
    const user = {
      _id: generateId(),
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      profileImg: userData.profileImg || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.firstName + ' ' + userData.lastName)}&background=random`,
      account: userData.account || 'basic',
      score: userData.score || 0,
      isAdmin: userData.isAdmin || false,
      role: userData.role || 'user',
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    return user;
  },

  // Get user by email
  async getByEmail(email) {
    return users.find((u) => u.email === email) || null;
  },

  // Get user by ID
  async getById(id) {
    return users.find((u) => u._id === id) || null;
  },

  // Get all users
  async getAll() {
    return [...users];
  },

  // Update user
  async update(id, updateData) {
    const userIndex = users.findIndex((u) => u._id === id);
    if (userIndex === -1) return null;

    users[userIndex] = {
      ...users[userIndex],
      ...updateData,
      _id: id, // Ensure ID doesn't change
    };
    return users[userIndex];
  },

  // Delete user
  async delete(id) {
    const userIndex = users.findIndex((u) => u._id === id);
    if (userIndex === -1) return false;

    users.splice(userIndex, 1);
    return true;
  },
};


import express from 'express';
import { userService } from '../services/user.service.js';

const router = express.Router();

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

// GET /api/user - List all users
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const users = await userService.getAll();
    // Remove passwords from response
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    res.json(usersWithoutPasswords);
  } catch (error) {
    next(error);
  }
});

// GET /api/user/:id - Get single user
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const user = await userService.getById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { password, ...userResponse } = user;
    res.json(userResponse);
  } catch (error) {
    next(error);
  }
});

// PUT /api/user/:id - Update user (mainly for score updates)
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const { _id, score, ...otherFields } = req.body;
    
    // Only allow updating score and other safe fields
    const updateData = {};
    if (score !== undefined) updateData.score = score;
    if (otherFields.firstName) updateData.firstName = otherFields.firstName;
    if (otherFields.lastName) updateData.lastName = otherFields.lastName;
    if (otherFields.profileImg) updateData.profileImg = otherFields.profileImg;
    if (otherFields.account) updateData.account = otherFields.account;

    const updatedUser = await userService.update(req.params.id, updateData);
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { password, ...userResponse } = updatedUser;
    res.json(userResponse);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/user/:id - Delete user
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const deleted = await userService.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;


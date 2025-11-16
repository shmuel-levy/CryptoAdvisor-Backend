import express from 'express';
import { userService } from '../services/user.service.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, profileImg, role = 'user' } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        message: 'Email, password, firstName, and lastName are required' 
      });
    }

    // Check if user already exists
    const existingUser = await userService.getByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await userService.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      profileImg: profileImg || `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + ' ' + lastName)}&background=random`,
      role,
      account: 'basic',
      score: 0,
      isAdmin: false,
    });

    // Set session
    req.session.userId = user._id;
    req.session.email = user.email;

    // Return user (without password)
    const { password: _, ...userResponse } = user;
    res.status(200).json(userResponse);
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }

    // Find user
    const user = await userService.getByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Set session
    req.session.userId = user._id;
    req.session.email = user.email;

    // Return user (without password)
    const { password: _, ...userResponse } = user;
    res.status(200).json(userResponse);
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res, next) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      res.clearCookie('sessionId');
      res.status(200).json({ message: 'Logged out successfully' });
    });
  } catch (error) {
    next(error);
  }
});

export default router;


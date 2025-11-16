const { verifyToken } = require('../utils/jwt.utils');

/**
 * JWT Authentication Middleware
 * Extracts token from Authorization header and verifies it
 * Attaches decoded user info to req.user
 */
const verifyTokenMiddleware = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Check if header format is "Bearer TOKEN"
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    const token = parts[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      }
      return res.status(401).json({ message: 'Token verification failed' });
    }
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

module.exports = {
  verifyTokenMiddleware,
};


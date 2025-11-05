const jwt = require('jsonwebtoken');
const { query } = require('../config/mysql');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header required' });
    }

    // Extract token from "Bearer TOKEN" format
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Invalid authorization header format' });
    }

    const token = parts[1];
    
    console.log('🔐 JWT_SECRET:', process.env.JWT_SECRET);
    console.log('🔐 TOKEN:', token.substring(0, 20) + '...');

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      console.error('❌ JWT Verification Error:', jwtError.message);
      return res.status(401).json({ message: 'Invalid token', error: jwtError.message });
    }

    console.log('✅ Token decoded:', decoded);

    // Get user from database
    const users = await query(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = users[0];
    next();

  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const users = await query(
        'SELECT id, name, email, role FROM users WHERE id = ?',
        [decoded.userId]
      );

      if (users.length > 0) {
        req.user = users[0];
      }
    }

    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  optionalAuth
};

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/mysql');
const { validateEmail, validatePassword } = require('../utils/validators');

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

const register = async (req, res) => {
  try {
    const { name, email, password, role = 'student' } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' 
      });
    }

    // Check if user exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const result = await query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, role]
    );

    const userId = result.insertId;

    // Create user profile
    await query(
      'INSERT INTO user_profiles (user_id) VALUES (?)',
      [userId]
    );

    // Create user stats
    await query(
      'INSERT INTO user_stats (user_id) VALUES (?)',
      [userId]
    );

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(userId);

    // Store refresh token
    await query(
      'UPDATE users SET refresh_token = ? WHERE id = ?',
      [refreshToken, userId]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: userId,
        name,
        email,
        role
      },
      token: accessToken
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const users = await query(
      'SELECT id, name, email, password_hash, role FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users;

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Store refresh token and update last login
    await query(
      'UPDATE users SET refresh_token = ?, last_login = NOW() WHERE id = ?',
      [refreshToken, user.id]
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token: accessToken
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token exists in database
    const users = await query(
      'SELECT id, name, email, role FROM users WHERE id = ? AND refresh_token = ?',
      [decoded.userId, token]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const user = users;

    // Generate new tokens
    const tokens = generateTokens(user.id);

    // Update refresh token
    await query(
      'UPDATE users SET refresh_token = ? WHERE id = ?',
      [tokens.refreshToken, user.id]
    );

    res.json({
      user,
      token: tokens.accessToken
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

const logout = async (req, res) => {
  try {
    const userId = req.user.id;

    // Clear refresh token
    await query(
      'UPDATE users SET refresh_token = NULL WHERE id = ?',
      [userId]
    );

    res.json({ message: 'Logout successful' });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const verifyToken = async (req, res) => {
  try {
    const user = req.user;
    
    // Get fresh user data
    const users = await query(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [user.id]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }

    res.json({ user: users });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  verifyToken
};

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/mysql');

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const register = async (req, res) => {
  try {
    const { name, email, password, role = 'student' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if email already exists
    const existingUsers = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Insert user
    const result = await query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, role]
    );

    const userId = result.insertId;

    // Create profile and stats - check if they already exist first
    try {
      await query('INSERT INTO user_profiles (user_id) VALUES (?)', [userId]);
    } catch (profileError) {
      if (profileError.code !== 'ER_DUP_ENTRY') {
        throw profileError;
      }
      // Profile already exists, continue
    }

    try {
      await query('INSERT INTO user_stats (user_id) VALUES (?)', [userId]);
    } catch (statsError) {
      if (statsError.code !== 'ER_DUP_ENTRY') {
        throw statsError;
      }
      // Stats already exists, continue
    }

    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);

    await query(
      'UPDATE users SET refresh_token = ? WHERE id = ?',
      [refreshToken, userId]
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: userId,
        name,
        email,
        role
      },
      accessToken,
      refreshToken
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email already registered' });
    }
    
    res.status(500).json({ message: 'Internal server error' });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const users = await query(
      'SELECT id, name, email, password_hash, role FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

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
      accessToken,
      refreshToken
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const users = await query(
      `SELECT 
        u.id, u.name, u.email, u.role, u.profile_picture,
        p.bio, p.skills, p.experience_level,
        s.problems_solved, s.total_xp, s.current_streak
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      LEFT JOIN user_stats s ON u.id = s.user_id
      WHERE u.id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile: {
        bio: user.bio,
        skills: user.skills ? JSON.parse(user.skills) : [],
        experienceLevel: user.experience_level
      },
      stats: {
        problemsSolved: user.problems_solved,
        totalXp: user.total_xp,
        currentStreak: user.current_streak
      }
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser
};

const express = require('express');
const { query } = require('../config/mysql');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');
const { 
  validateUserManagement,
  validatePagination,
  validateId 
} = require('../middleware/validationMiddleware');

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(requireRole(['admin']));

// User management
router.get('/users', validatePagination, async (req, res) => {
  try {
    const { role, search, limit = 20, offset = 0 } = req.query;
    
    let sql = 'SELECT id, name, email, role, created_at, last_login FROM users WHERE 1=1';
    const params = [];

    if (role) {
      sql += ' AND role = ?';
      params.push(role);
    }

    if (search) {
      sql += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const users = await query(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    let countParams = [];

    if (role) {
      countSql += ' AND role = ?';
      countParams.push(role);
    }

    if (search) {
      countSql += ' AND (name LIKE ? OR email LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const [{ total }] = await query(countSql, countParams);

    res.json({
      users,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: offset + users.length < total
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/users/:id', validateId, async (req, res) => {
  try {
    const { id } = req.params;

    const [user] = await query(
      `SELECT 
        u.id, u.name, u.email, u.role, u.created_at, u.last_login,
        p.bio, p.skills, p.experience_level,
        s.problems_solved, s.total_xp, s.current_streak
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      LEFT JOIN user_stats s ON u.id = s.user_id
      WHERE u.id = ?`,
      [id]
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      ...user,
      skills: user.skills ? JSON.parse(user.skills) : []
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/users/:id', validateId, validateUserManagement, async (req, res) => {
  try {
    const { id } = req.params;
    const { role, status } = req.body;

    const updates = [];
    const params = [];

    if (role) {
      updates.push('role = ?');
      params.push(role);
    }

    if (status) {
      updates.push('status = ?');
      params.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    params.push(id);

    await query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
      params
    );

    res.json({ message: 'User updated successfully' });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// System statistics
router.get('/stats', async (req, res) => {
  try {
    const [userStats] = await query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'student' THEN 1 END) as students,
        COUNT(CASE WHEN role = 'recruiter' THEN 1 END) as recruiters,
        COUNT(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as active_users
      FROM users
    `);

    const [questionStats] = await query(`
      SELECT 
        COUNT(*) as total_questions,
        COUNT(CASE WHEN difficulty = 'Easy' THEN 1 END) as easy_questions,
        COUNT(CASE WHEN difficulty = 'Medium' THEN 1 END) as medium_questions,
        COUNT(CASE WHEN difficulty = 'Hard' THEN 1 END) as hard_questions
      FROM dsa_questions
    `);

    const [submissionStats] = await query(`
      SELECT 
        COUNT(*) as total_submissions,
        COUNT(CASE WHEN status = 'Accepted' THEN 1 END) as accepted_submissions,
        COUNT(CASE WHEN submitted_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as recent_submissions
      FROM submissions
    `);

    const [interviewStats] = await query(`
      SELECT 
        COUNT(*) as total_interviews,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_interviews,
        AVG(CASE WHEN score IS NOT NULL THEN score END) as avg_score
      FROM interview_sessions
    `);

    res.json({
      users: userStats,
      questions: questionStats,
      submissions: submissionStats,
      interviews: {
        ...interviewStats,
        avg_score: Math.round(interviewStats.avg_score || 0)
      }
    });

  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DSA Question management
router.get('/questions', validatePagination, async (req, res) => {
  try {
    const { difficulty, category, limit = 20, offset = 0 } = req.query;
    
    let sql = 'SELECT * FROM dsa_questions WHERE 1=1';
    const params = [];

    if (difficulty) {
      sql += ' AND difficulty = ?';
      params.push(difficulty);
    }

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const questions = await query(sql, params);

    res.json({
      questions: questions.map(q => ({
        ...q,
        tags: JSON.parse(q.tags || '[]'),
        examples: JSON.parse(q.examples || '[]'),
        constraints: JSON.parse(q.constraints || '[]')
      }))
    });

  } catch (error) {
    console.error('Get admin questions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/questions', async (req, res) => {
  try {
    const {
      questionId,
      title,
      description,
      difficulty,
      category,
      tags = [],
      examples = [],
      constraints = [],
      testCases = [],
      starterCode = {},
      solution = {},
      hints = ''
    } = req.body;

    // Validation
    if (!questionId || !title || !description || !difficulty || !category) {
      return res.status(400).json({ 
        message: 'Question ID, title, description, difficulty, and category are required' 
      });
    }

    const result = await query(
      `INSERT INTO dsa_questions 
      (question_id, title, description, difficulty, category, tags, examples, constraints, 
       test_cases, starter_code, solution, hints) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        questionId,
        title,
        description,
        difficulty,
        category,
        JSON.stringify(tags),
        JSON.stringify(examples),
        JSON.stringify(constraints),
        JSON.stringify(testCases),
        JSON.stringify(starterCode),
        JSON.stringify(solution),
        hints
      ]
    );

    res.status(201).json({
      message: 'Question created successfully',
      id: result.insertId
    });

  } catch (error) {
    console.error('Create question error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ message: 'Question ID already exists' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

module.exports = router;

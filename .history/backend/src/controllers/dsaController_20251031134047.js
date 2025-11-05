const axios = require('axios');
const { query } = require('../config/mysql');
const { getRedis } = require('../config/redis');

const getQuestions = async (req, res) => {
  try {
    const { difficulty, category, tags, limit = 20, offset = 0 } = req.query;
    
    let sql = 'SELECT * FROM dsa_questions WHERE 1=1';
    let params = [];

    if (difficulty) {
      sql += ' AND difficulty = ?';
      params.push(difficulty);
    }

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (tags) {
      sql += ' AND JSON_OVERLAPS(tags, ?)';
      params.push(JSON.stringify(tags.split(',')));
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const questions = await query(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM dsa_questions WHERE 1=1';
    let countParams = [];

    if (difficulty) {
      countSql += ' AND difficulty = ?';
      countParams.push(difficulty);
    }

    if (category) {
      countSql += ' AND category = ?';
      countParams.push(category);
    }

    const [{ total }] = await query(countSql, countParams);

    res.json({
      questions: questions.map(q => ({
        ...q,
        tags: JSON.parse(q.tags || '[]'),
        examples: JSON.parse(q.examples || '[]'),
        constraints: JSON.parse(q.constraints || '[]'),
        starterCode: JSON.parse(q.starter_code || '{}')
      })),
      total,
      hasMore: offset + questions.length < total
    });

  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const questions = await query(
      'SELECT * FROM dsa_questions WHERE id = ? OR question_id = ?',
      [id, id]
    );

    if (questions.length === 0) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const question = questions;

    res.json({
      ...question,
      tags: JSON.parse(question.tags || '[]'),
      examples: JSON.parse(question.examples || '[]'),
      constraints: JSON.parse(question.constraints || '[]'),
      testCases: JSON.parse(question.test_cases || '[]'),
      starterCode: JSON.parse(question.starter_code || '{}'),
      solution: JSON.parse(question.solution || '{}')
    });

  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const submitSolution = async (req, res) => {
  try {
    const { questionId, code, language } = req.body;
    const userId = req.user.id;

    if (!questionId || !code || !language) {
      return res.status(400).json({ message: 'Question ID, code, and language are required' });
    }

    // Get question
    const questions = await query(
      'SELECT * FROM dsa_questions WHERE id = ? OR question_id = ?',
      [questionId, questionId]
    );

    if (questions.length === 0) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const question = questions;
    const testCases = JSON.parse(question.test_cases || '[]');

    // Execute code (simplified - in production, use sandboxed execution)
    const result = await executeCode(code, language, testCases);

    // Calculate score
    const score = Math.round((result.testCasesPassed / result.totalTestCases) * 100);
    const xpGained = result.status === 'Accepted' ? calculateXP(question.difficulty) : 0;

    // Save submission
    await query(
      `INSERT INTO submissions (user_id, question_id, code, language, status, runtime, 
       memory_usage, test_cases_passed, total_test_cases, score, submitted_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        userId, questionId, code, language, result.status,
        result.runtime, result.memory, result.testCasesPassed,
        result.totalTestCases, score
      ]
    );

    // Update user stats if accepted
    if (result.status === 'Accepted') {
      await updateUserStats(userId, xpGained, question.difficulty);
    }

    res.json({
      ...result,
      score,
      xpGained
    });

  } catch (error) {
    console.error('Submit solution error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getHint = async (req, res) => {
  try {
    const { questionId, currentCode, language } = req.body;

    // Get question
    const questions = await query(
      'SELECT * FROM dsa_questions WHERE id = ? OR question_id = ?',
      [questionId, questionId]
    );

    if (questions.length === 0) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Generate AI hint (simplified - integrate with actual AI service)
    const hint = await generateAIHint(questions, currentCode, language);

    res.json({ hint });

  } catch (error) {
    console.error('Get hint error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const runCode = async (req, res) => {
  try {
    const { questionId, code, language } = req.body;

    // Get question
    const questions = await query(
      'SELECT * FROM dsa_questions WHERE id = ? OR question_id = ?',
      [questionId, questionId]
    );

    if (questions.length === 0) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const question = questions;
    const testCases = JSON.parse(question.test_cases || '[]').slice(0, 3); // Run only first 3 test cases

    // Execute code
    const result = await executeCode(code, language, testCases);

    res.json(result);

  } catch (error) {
    console.error('Run code error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Helper functions
const executeCode = async (code, language, testCases) => {
  // Simplified code execution - in production, use Docker containers
  // This is a mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      const passed = Math.floor(Math.random() * testCases.length) + 1;
      const status = passed === testCases.length ? 'Accepted' : 'Wrong Answer';
      
      resolve({
        status,
        runtime: Math.floor(Math.random() * 100) + 50,
        memory: Math.floor(Math.random() * 1000) + 500,
        testCasesPassed: passed,
        totalTestCases: testCases.length,
        output: testCases.map((_, i) => i < passed ? 'Passed' : 'Failed')
      });
    }, 1000);
  });
};

const calculateXP = (difficulty) => {
  const xpMap = {
    'Easy': 10,
    'Medium': 25,
    'Hard': 50
  };
  return xpMap[difficulty] || 10;
};

const updateUserStats = async (userId, xpGained, difficulty) => {
  try {
    // Update XP and problems solved
    await query(
      `UPDATE user_stats SET 
       total_xp = total_xp + ?, 
       problems_solved = problems_solved + 1,
       total_submissions = total_submissions + 1,
       last_activity = NOW()
       WHERE user_id = ?`,
      [xpGained, userId]
    );

    // Update streak (simplified logic)
    const [stats] = await query(
      'SELECT last_activity FROM user_stats WHERE user_id = ?',
      [userId]
    );

    const lastActivity = new Date(stats.last_activity);
    const now = new Date();
    const daysDiff = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));

    if (daysDiff <= 1) {
      await query(
        'UPDATE user_stats SET current_streak = current_streak + 1 WHERE user_id = ?',
        [userId]
      );
    } else if (daysDiff > 1) {
      await query(
        'UPDATE user_stats SET current_streak = 1 WHERE user_id = ?',
        [userId]
      );
    }

    // Update max streak
    await query(
      `UPDATE user_stats SET max_streak = GREATEST(max_streak, current_streak) 
       WHERE user_id = ?`,
      [userId]
    );

  } catch (error) {
    console.error('Update user stats error:', error);
  }
};

const generateAIHint = async (question, currentCode, language) => {
  // Mock AI hint generation - integrate with actual AI service
  const hints = [
    "Consider using a hash map to optimize lookup time",
    "Think about the two-pointer technique for this problem",
    "Can you solve this using dynamic programming?",
    "Try breaking the problem into smaller subproblems",
    "Consider the edge cases in your solution"
  ];
  
  return hints[Math.floor(Math.random() * hints.length)];
};

module.exports = {
  getQuestions,
  getQuestion,
  submitSolution,
  getHint,
  runCode
};

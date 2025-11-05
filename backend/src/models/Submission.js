const { query } = require('../config/mysql');

class Submission {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.questionId = data.question_id;
    this.code = data.code;
    this.language = data.language;
    this.status = data.status;
    this.runtime = data.runtime;
    this.memoryUsage = data.memory_usage;
    this.testCasesPassed = data.test_cases_passed;
    this.totalTestCases = data.total_test_cases;
    this.score = data.score;
    this.submittedAt = data.submitted_at;
  }

  static async findById(id) {
    try {
      const submissions = await query(
        'SELECT * FROM submissions WHERE id = ?',
        [id]
      );
      
      return submissions.length > 0 ? new Submission(submissions) : null;
    } catch (error) {
      throw new Error(`Error finding submission by ID: ${error.message}`);
    }
  }

  static async findByUserId(userId, filters = {}, pagination = {}) {
    try {
      const { status, language, questionId } = filters;
      const { limit = 20, offset = 0 } = pagination;

      let sql = 'SELECT * FROM submissions WHERE user_id = ?';
      const params = [userId];

      if (status) {
        sql += ' AND status = ?';
        params.push(status);
      }

      if (language) {
        sql += ' AND language = ?';
        params.push(language);
      }

      if (questionId) {
        sql += ' AND question_id = ?';
        params.push(questionId);
      }

      sql += ' ORDER BY submitted_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const submissions = await query(sql, params);
      
      return submissions.map(submission => new Submission(submission));
    } catch (error) {
      throw new Error(`Error finding submissions by user ID: ${error.message}`);
    }
  }

  static async findByQuestionId(questionId, filters = {}, pagination = {}) {
    try {
      const { status, language } = filters;
      const { limit = 20, offset = 0 } = pagination;

      let sql = 'SELECT * FROM submissions WHERE question_id = ?';
      const params = [questionId];

      if (status) {
        sql += ' AND status = ?';
        params.push(status);
      }

      if (language) {
        sql += ' AND language = ?';
        params.push(language);
      }

      sql += ' ORDER BY submitted_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const submissions = await query(sql, params);
      
      return submissions.map(submission => new Submission(submission));
    } catch (error) {
      throw new Error(`Error finding submissions by question ID: ${error.message}`);
    }
  }

  static async create(submissionData) {
    try {
      const {
        userId,
        questionId,
        code,
        language,
        status,
        runtime = null,
        memoryUsage = null,
        testCasesPassed = 0,
        totalTestCases = 0,
        score = 0
      } = submissionData;

      const result = await query(
        `INSERT INTO submissions 
        (user_id, question_id, code, language, status, runtime, memory_usage, 
         test_cases_passed, total_test_cases, score, submitted_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          userId,
          questionId,
          code,
          language,
          status,
          runtime,
          memoryUsage,
          testCasesPassed,
          totalTestCases,
          score
        ]
      );

      return await Submission.findById(result.insertId);
    } catch (error) {
      throw new Error(`Error creating submission: ${error.message}`);
    }
  }

  static async getStats(userId, timeframe = 'all') {
    try {
      let timeCondition = '';
      const params = [userId];

      if (timeframe === 'week') {
        timeCondition = 'AND submitted_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
      } else if (timeframe === 'month') {
        timeCondition = 'AND submitted_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
      }

      const [stats] = await query(
        `SELECT 
          COUNT(*) as total_submissions,
          COUNT(CASE WHEN status = 'Accepted' THEN 1 END) as accepted_submissions,
          AVG(CASE WHEN runtime IS NOT NULL THEN runtime END) as avg_runtime,
          AVG(CASE WHEN memory_usage IS NOT NULL THEN memory_usage END) as avg_memory,
          AVG(score) as avg_score
        FROM submissions 
        WHERE user_id = ? ${timeCondition}`,
        params
      );

      return {
        totalSubmissions: stats.total_submissions,
        acceptedSubmissions: stats.accepted_submissions,
        acceptanceRate: stats.total_submissions > 0 ? 
          (stats.accepted_submissions / stats.total_submissions) * 100 : 0,
        avgRuntime: Math.round(stats.avg_runtime || 0),
        avgMemory: Math.round(stats.avg_memory || 0),
        avgScore: Math.round(stats.avg_score || 0)
      };
    } catch (error) {
      throw new Error(`Error getting submission stats: ${error.message}`);
    }
  }

  static async getLanguageStats(userId) {
    try {
      const languageStats = await query(
        `SELECT 
          language,
          COUNT(*) as count,
          COUNT(CASE WHEN status = 'Accepted' THEN 1 END) as accepted,
          AVG(score) as avg_score
        FROM submissions 
        WHERE user_id = ?
        GROUP BY language
        ORDER BY count DESC`,
        [userId]
      );

      return languageStats.map(stat => ({
        language: stat.language,
        count: stat.count,
        accepted: stat.accepted,
        acceptanceRate: stat.count > 0 ? (stat.accepted / stat.count) * 100 : 0,
        avgScore: Math.round(stat.avg_score || 0)
      }));
    } catch (error) {
      throw new Error(`Error getting language stats: ${error.message}`);
    }
  }

  static async getDifficultyStats(userId) {
    try {
      const difficultyStats = await query(
        `SELECT 
          dq.difficulty,
          COUNT(*) as total_attempts,
          COUNT(CASE WHEN s.status = 'Accepted' THEN 1 END) as solved
        FROM submissions s
        JOIN dsa_questions dq ON s.question_id = dq.question_id
        WHERE s.user_id = ?
        GROUP BY dq.difficulty`,
        [userId]
      );

      return difficultyStats.map(stat => ({
        difficulty: stat.difficulty,
        totalAttempts: stat.total_attempts,
        solved: stat.solved,
        solveRate: stat.total_attempts > 0 ? (stat.solved / stat.total_attempts) * 100 : 0
      }));
    } catch (error) {
      throw new Error(`Error getting difficulty stats: ${error.message}`);
    }
  }

  static async getRecentActivity(userId, limit = 10) {
    try {
      const activity = await query(
        `SELECT 
          s.id, s.status, s.score, s.submitted_at,
          dq.title, dq.difficulty, dq.category
        FROM submissions s
        JOIN dsa_questions dq ON s.question_id = dq.question_id
        WHERE s.user_id = ?
        ORDER BY s.submitted_at DESC
        LIMIT ?`,
        [userId, limit]
      );

      return activity.map(item => ({
        id: item.id,
        status: item.status,
        score: item.score,
        submittedAt: item.submitted_at,
        question: {
          title: item.title,
          difficulty: item.difficulty,
          category: item.category
        }
      }));
    } catch (error) {
      throw new Error(`Error getting recent activity: ${error.message}`);
    }
  }

  static async getBestSubmission(userId, questionId) {
    try {
      const submissions = await query(
        `SELECT * FROM submissions 
        WHERE user_id = ? AND question_id = ? AND status = 'Accepted'
        ORDER BY score DESC, runtime ASC
        LIMIT 1`,
        [userId, questionId]
      );

      return submissions.length > 0 ? new Submission(submissions) : null;
    } catch (error) {
      throw new Error(`Error getting best submission: ${error.message}`);
    }
  }

  static async getSubmissionTrend(userId, days = 30) {
    try {
      const trend = await query(
        `SELECT 
          DATE(submitted_at) as date,
          COUNT(*) as submissions,
          COUNT(CASE WHEN status = 'Accepted' THEN 1 END) as accepted
        FROM submissions 
        WHERE user_id = ? AND submitted_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY DATE(submitted_at)
        ORDER BY date`,
        [userId, days]
      );

      return trend.map(item => ({
        date: item.date,
        submissions: item.submissions,
        accepted: item.accepted,
        acceptanceRate: item.submissions > 0 ? (item.accepted / item.submissions) * 100 : 0
      }));
    } catch (error) {
      throw new Error(`Error getting submission trend: ${error.message}`);
    }
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      questionId: this.questionId,
      code: this.code,
      language: this.language,
      status: this.status,
      runtime: this.runtime,
      memoryUsage: this.memoryUsage,
      testCasesPassed: this.testCasesPassed,
      totalTestCases: this.totalTestCases,
      score: this.score,
      submittedAt: this.submittedAt
    };
  }
}

module.exports = Submission;

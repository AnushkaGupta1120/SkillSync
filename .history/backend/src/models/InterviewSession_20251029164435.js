const { query } = require('../config/mysql');

class InterviewSession {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.sessionType = data.session_type;
    this.status = data.status;
    this.questions = data.questions ? JSON.parse(data.questions) : [];
    this.answers = data.answers ? JSON.parse(data.answers) : [];
    this.feedback = data.feedback ? JSON.parse(data.feedback) : {};
    this.score = data.score;
    this.duration = data.duration;
    this.scheduledDate = data.scheduled_date;
    this.startedAt = data.started_at;
    this.completedAt = data.completed_at;
    this.recruiterNotes = data.recruiter_notes;
    this.createdBy = data.created_by;
  }

  static async findById(id) {
    try {
      const sessions = await query(
        'SELECT * FROM interview_sessions WHERE id = ?',
        [id]
      );
      
      return sessions.length > 0 ? new InterviewSession(sessions) : null;
    } catch (error) {
      throw new Error(`Error finding interview session by ID: ${error.message}`);
    }
  }

  static async findByUserId(userId, filters = {}, pagination = {}) {
    try {
      const { status, type } = filters;
      const { limit = 20, offset = 0 } = pagination;

      let sql = 'SELECT * FROM interview_sessions WHERE user_id = ?';
      const params = [userId];

      if (status) {
        sql += ' AND status = ?';
        params.push(status);
      }

      if (type) {
        sql += ' AND session_type = ?';
        params.push(type);
      }

      sql += ' ORDER BY started_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const sessions = await query(sql, params);
      
      return sessions.map(session => new InterviewSession(session));
    } catch (error) {
      throw new Error(`Error finding interview sessions by user ID: ${error.message}`);
    }
  }

  static async create(sessionData) {
    try {
      const {
        id,
        userId,
        sessionType,
        status = 'scheduled',
        questions = [],
        scheduledDate = null,
        recruiterNotes = '',
        createdBy = null
      } = sessionData;

      const result = await query(
        `INSERT INTO interview_sessions 
        (id, user_id, session_type, status, questions, scheduled_date, recruiter_notes, created_by, started_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          id,
          userId,
          sessionType,
          status,
          JSON.stringify(questions),
          scheduledDate,
          recruiterNotes,
          createdBy
        ]
      );

      return await InterviewSession.findById(id);
    } catch (error) {
      throw new Error(`Error creating interview session: ${error.message}`);
    }
  }

  async updateAnswers(answers) {
    try {
      await query(
        'UPDATE interview_sessions SET answers = ?, updated_at = NOW() WHERE id = ?',
        [JSON.stringify(answers), this.id]
      );
      
      this.answers = answers;
    } catch (error) {
      throw new Error(`Error updating answers: ${error.message}`);
    }
  }

  async complete(feedback, score, duration) {
    try {
      await query(
        `UPDATE interview_sessions SET 
         status = 'completed', 
         feedback = ?, 
         score = ?, 
         duration = ?, 
         completed_at = NOW() 
         WHERE id = ?`,
        [JSON.stringify(feedback), score, duration, this.id]
      );
      
      this.status = 'completed';
      this.feedback = feedback;
      this.score = score;
      this.duration = duration;
      this.completedAt = new Date();
    } catch (error) {
      throw new Error(`Error completing interview session: ${error.message}`);
    }
  }

  async updateStatus(status) {
    try {
      await query(
        'UPDATE interview_sessions SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, this.id]
      );
      
      this.status = status;
    } catch (error) {
      throw new Error(`Error updating status: ${error.message}`);
    }
  }

  static async getStatsByUser(userId) {
    try {
      const [stats] = await query(
        `SELECT 
          COUNT(*) as total_interviews,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_interviews,
          AVG(CASE WHEN score IS NOT NULL THEN score END) as avg_score,
          COUNT(CASE WHEN session_type = 'technical' AND status = 'completed' THEN 1 END) as technical_interviews,
          COUNT(CASE WHEN session_type = 'behavioral' AND status = 'completed' THEN 1 END) as behavioral_interviews,
          COUNT(CASE WHEN session_type = 'system_design' AND status = 'completed' THEN 1 END) as system_design_interviews
        FROM interview_sessions 
        WHERE user_id = ?`,
        [userId]
      );

      return {
        totalInterviews: stats.total_interviews,
        completedInterviews: stats.completed_interviews,
        avgScore: Math.round(stats.avg_score || 0),
        technicalInterviews: stats.technical_interviews,
        behavioralInterviews: stats.behavioral_interviews,
        systemDesignInterviews: stats.system_design_interviews
      };
    } catch (error) {
      throw new Error(`Error getting interview stats: ${error.message}`);
    }
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      sessionType: this.sessionType,
      status: this.status,
      questions: this.questions,
      answers: this.answers,
      feedback: this.feedback,
      score: this.score,
      duration: this.duration,
      scheduledDate: this.scheduledDate,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      recruiterNotes: this.recruiterNotes,
      createdBy: this.createdBy
    };
  }
}

module.exports = InterviewSession;

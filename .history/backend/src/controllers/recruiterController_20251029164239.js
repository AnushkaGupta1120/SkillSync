const { query } = require('../config/mysql');

const getCandidates = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const { 
      search, 
      skills, 
      experienceLevel, 
      minAtsScore, 
      status,
      limit = 20, 
      offset = 0,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    let sql = `
      SELECT 
        u.id, u.name, u.email, u.created_at,
        p.skills, p.experience_level, p.github_url, p.linkedin_url,
        s.problems_solved, s.total_xp, s.current_streak, s.rank_position,
        ra.ats_score, ra.analyzed_at,
        COALESCE(AVG(is_session.score), 0) as avg_interview_score
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      LEFT JOIN user_stats s ON u.id = s.user_id
      LEFT JOIN resume_analyses ra ON u.id = ra.user_id
      LEFT JOIN interview_sessions is_session ON u.id = is_session.user_id AND is_session.status = 'completed'
      WHERE u.role = 'student'
    `;
    
    let params = [];

    // Add search filters
    if (search) {
      sql += ' AND (u.name LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (skills) {
      const skillArray = skills.split(',');
      sql += ' AND JSON_OVERLAPS(p.skills, ?)';
      params.push(JSON.stringify(skillArray));
    }

    if (experienceLevel) {
      sql += ' AND p.experience_level = ?';
      params.push(experienceLevel);
    }

    if (minAtsScore) {
      sql += ' AND ra.ats_score >= ?';
      params.push(parseInt(minAtsScore));
    }

    sql += ' GROUP BY u.id';

    // Add sorting
    const allowedSortFields = ['name', 'created_at', 'total_xp', 'ats_score', 'avg_interview_score'];
    if (allowedSortFields.includes(sortBy)) {
      sql += ` ORDER BY ${sortBy} ${sortOrder === 'ASC' ? 'ASC' : 'DESC'}`;
    }

    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const candidates = await query(sql, params);

    // Get total count for pagination
    let countSql = 'SELECT COUNT(DISTINCT u.id) as total FROM users u LEFT JOIN user_profiles p ON u.id = p.user_id LEFT JOIN resume_analyses ra ON u.id = ra.user_id WHERE u.role = "student"';
    let countParams = [];
    
    if (search) {
      countSql += ' AND (u.name LIKE ? OR u.email LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const [{ total }] = await query(countSql, countParams);

    res.json({
      candidates: candidates.map(candidate => ({
        ...candidate,
        skills: candidate.skills ? JSON.parse(candidate.skills) : [],
        status: determineCandidateStatus(candidate),
        lastActivity: candidate.analyzed_at || candidate.created_at
      })),
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: offset + candidates.length < total
      }
    });

  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getCandidateDetails = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const recruiterId = req.user.id;

    // Get candidate basic info
    const candidates = await query(
      `SELECT 
        u.id, u.name, u.email, u.created_at,
        p.bio, p.skills, p.experience_level, p.github_url, p.linkedin_url, p.resume_url,
        s.problems_solved, s.total_submissions, s.total_xp, s.current_streak, s.max_streak, s.rank_position
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      LEFT JOIN user_stats s ON u.id = s.user_id
      WHERE u.id = ? AND u.role = 'student'`,
      [candidateId]
    );

    if (candidates.length === 0) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    const candidate = candidates;

    // Get resume analyses
    const resumeAnalyses = await query(
      'SELECT id, file_name, ats_score, analyzed_at FROM resume_analyses WHERE user_id = ? ORDER BY analyzed_at DESC LIMIT 5',
      [candidateId]
    );

    // Get interview history
    const interviews = await query(
      'SELECT id, session_type, status, score, duration, started_at, completed_at FROM interview_sessions WHERE user_id = ? ORDER BY started_at DESC LIMIT 10',
      [candidateId]
    );

    // Get recent submissions
    const recentSubmissions = await query(
      `SELECT 
        sq.title, sq.difficulty, s.status, s.score, s.runtime, s.submitted_at
      FROM submissions s
      JOIN dsa_questions sq ON s.question_id = sq.question_id
      WHERE s.user_id = ?
      ORDER BY s.submitted_at DESC
      LIMIT 10`,
      [candidateId]
    );

    // Calculate performance metrics
    const performanceMetrics = calculatePerformanceMetrics(recentSubmissions, interviews);

    res.json({
      ...candidate,
      skills: candidate.skills ? JSON.parse(candidate.skills) : [],
      resumeAnalyses,
      interviews: interviews.map(interview => ({
        ...interview,
        sessionType: interview.session_type,
        startedAt: interview.started_at,
        completedAt: interview.completed_at
      })),
      recentSubmissions,
      performanceMetrics,
      status: determineDetailedCandidateStatus(candidate, resumeAnalyses, interviews)
    });

  } catch (error) {
    console.error('Get candidate details error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const scheduleInterview = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { interviewType, scheduledDate, notes } = req.body;
    const recruiterId = req.user.id;

    if (!interviewType || !scheduledDate) {
      return res.status(400).json({ message: 'Interview type and scheduled date are required' });
    }

    // Verify candidate exists
    const candidates = await query(
      'SELECT id FROM users WHERE id = ? AND role = "student"',
      [candidateId]
    );

    if (candidates.length === 0) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Create interview session
    const sessionId = require('uuid').v4();
    
    await query(
      `INSERT INTO interview_sessions (id, user_id, session_type, status, scheduled_date, recruiter_notes, created_by) 
       VALUES (?, ?, ?, 'scheduled', ?, ?, ?)`,
      [sessionId, candidateId, interviewType, scheduledDate, notes || '', recruiterId]
    );

    // TODO: Send notification to candidate (integrate with email service)

    res.status(201).json({
      message: 'Interview scheduled successfully',
      sessionId,
      scheduledDate,
      interviewType
    });

  } catch (error) {
    console.error('Schedule interview error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getScheduledInterviews = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const { status = 'scheduled', limit = 20, offset = 0 } = req.query;

    const interviews = await query(
      `SELECT 
        is_session.id, is_session.session_type, is_session.status, is_session.scheduled_date,
        is_session.recruiter_notes, is_session.created_at,
        u.id as candidate_id, u.name as candidate_name, u.email as candidate_email
      FROM interview_sessions is_session
      JOIN users u ON is_session.user_id = u.id
      WHERE is_session.created_by = ? AND is_session.status = ?
      ORDER BY is_session.scheduled_date ASC
      LIMIT ? OFFSET ?`,
      [recruiterId, status, parseInt(limit), parseInt(offset)]
    );

    res.json({
      interviews: interviews.map(interview => ({
        id: interview.id,
        sessionType: interview.session_type,
        status: interview.status,
        scheduledDate: interview.scheduled_date,
        notes: interview.recruiter_notes,
        createdAt: interview.created_at,
        candidate: {
          id: interview.candidate_id,
          name: interview.candidate_name,
          email: interview.candidate_email
        }
      })),
      hasMore: interviews.length === parseInt(limit)
    });

  } catch (error) {
    console.error('Get scheduled interviews error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateInterviewStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { status, feedback, score } = req.body;
    const recruiterId = req.user.id;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    // Verify interview exists and belongs to recruiter
    const interviews = await query(
      'SELECT id FROM interview_sessions WHERE id = ? AND created_by = ?',
      [sessionId, recruiterId]
    );

    if (interviews.length === 0) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    const updateData = { status };
    const params = [status];

    if (feedback) {
      updateData.feedback = JSON.stringify(feedback);
      params.push(JSON.stringify(feedback));
    }

    if (score !== undefined) {
      updateData.score = score;
      params.push(score);
    }

    let sql = 'UPDATE interview_sessions SET status = ?';
    if (feedback) sql += ', feedback = ?';
    if (score !== undefined) sql += ', score = ?';
    sql += ', updated_at = NOW() WHERE id = ?';
    
    params.push(sessionId);

    await query(sql, params);

    res.json({ message: 'Interview status updated successfully' });

  } catch (error) {
    console.error('Update interview status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getCandidateAnalytics = async (req, res) => {
  try {
    const recruiterId = req.user.id;

    // Get overall candidate statistics
    const [stats] = await query(`
      SELECT 
        COUNT(*) as total_candidates,
        COUNT(CASE WHEN ra.ats_score IS NOT NULL THEN 1 END) as candidates_with_resume,
        COUNT(CASE WHEN is_session.id IS NOT NULL THEN 1 END) as candidates_interviewed,
        AVG(ra.ats_score) as avg_ats_score,
        AVG(is_session.score) as avg_interview_score
      FROM users u
      LEFT JOIN resume_analyses ra ON u.id = ra.user_id
      LEFT JOIN interview_sessions is_session ON u.id = is_session.user_id AND is_session.status = 'completed'
      WHERE u.role = 'student'
    `);

    // Get skill distribution
    const skillDistribution = await query(`
      SELECT 
        JSON_EXTRACT(p.skills, '$[*]') as skill_list,
        COUNT(*) as candidate_count
      FROM user_profiles p
      JOIN users u ON p.user_id = u.id
      WHERE u.role = 'student' AND p.skills IS NOT NULL
      GROUP BY JSON_EXTRACT(p.skills, '$[*]')
      ORDER BY candidate_count DESC
      LIMIT 10
    `);

    // Get experience level distribution
    const experienceDistribution = await query(`
      SELECT 
        p.experience_level,
        COUNT(*) as count
      FROM user_profiles p
      JOIN users u ON p.user_id = u.id
      WHERE u.role = 'student' AND p.experience_level IS NOT NULL
      GROUP BY p.experience_level
    `);

    // Get recent activity
    const recentActivity = await query(`
      SELECT 
        'resume_analysis' as activity_type,
        ra.analyzed_at as activity_date,
        u.name as candidate_name,
        ra.ats_score as score
      FROM resume_analyses ra
      JOIN users u ON ra.user_id = u.id
      WHERE ra.analyzed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      
      UNION ALL
      
      SELECT 
        'interview_completed' as activity_type,
        is_session.completed_at as activity_date,
        u.name as candidate_name,
        is_session.score
      FROM interview_sessions is_session
      JOIN users u ON is_session.user_id = u.id
      WHERE is_session.completed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      
      ORDER BY activity_date DESC
      LIMIT 20
    `);

    res.json({
      overview: {
        totalCandidates: stats.total_candidates,
        candidatesWithResume: stats.candidates_with_resume,
        candidatesInterviewed: stats.candidates_interviewed,
        avgAtsScore: Math.round(stats.avg_ats_score || 0),
        avgInterviewScore: Math.round(stats.avg_interview_score || 0)
      },
      skillDistribution: skillDistribution.map(item => ({
        skills: JSON.parse(item.skill_list || '[]'),
        count: item.candidate_count
      })),
      experienceDistribution,
      recentActivity: recentActivity.map(activity => ({
        type: activity.activity_type,
        date: activity.activity_date,
        candidateName: activity.candidate_name,
        score: activity.score
      }))
    });

  } catch (error) {
    console.error('Get candidate analytics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Helper functions
const determineCandidateStatus = (candidate) => {
  if (candidate.ats_score && candidate.avg_interview_score > 0) {
    return 'interviewed';
  } else if (candidate.ats_score) {
    return 'reviewed';
  } else {
    return 'new';
  }
};

const determineDetailedCandidateStatus = (candidate, resumeAnalyses, interviews) => {
  const hasResume = resumeAnalyses.length > 0;
  const hasCompletedInterview = interviews.some(i => i.status === 'completed');
  const hasScheduledInterview = interviews.some(i => i.status === 'scheduled');

  if (hasCompletedInterview) return 'interviewed';
  if (hasScheduledInterview) return 'scheduled';
  if (hasResume) return 'reviewed';
  return 'new';
};

const calculatePerformanceMetrics = (submissions, interviews) => {
  const totalSubmissions = submissions.length;
  const acceptedSubmissions = submissions.filter(s => s.status === 'Accepted').length;
  const accuracy = totalSubmissions > 0 ? (acceptedSubmissions / totalSubmissions) * 100 : 0;

  const completedInterviews = interviews.filter(i => i.status === 'completed');
  const avgInterviewScore = completedInterviews.length > 0 
    ? completedInterviews.reduce((sum, i) => sum + (i.score || 0), 0) / completedInterviews.length 
    : 0;

  return {
    codingAccuracy: Math.round(accuracy),
    totalSubmissions,
    acceptedSubmissions,
    avgInterviewScore: Math.round(avgInterviewScore),
    totalInterviews: completedInterviews.length,
    consistency: calculateConsistencyScore(submissions)
  };
};

const calculateConsistencyScore = (submissions) => {
  if (submissions.length < 3) return 0;
  
  // Simple consistency calculation based on recent performance
  const recentSubmissions = submissions.slice(0, 5);
  const acceptedCount = recentSubmissions.filter(s => s.status === 'Accepted').length;
  
  return Math.round((acceptedCount / recentSubmissions.length) * 100);
};

module.exports = {
  getCandidates,
  getCandidateDetails,
  scheduleInterview,
  getScheduledInterviews,
  updateInterviewStatus,
  getCandidateAnalytics
};

const { query } = require('../config/mysql');

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [user] = await query(
      `SELECT u.*, p.bio, p.skills, p.experience_level, p.github_url, 
              p.linkedin_url, p.resume_url, s.problems_solved, s.total_xp, 
              s.current_streak, s.max_streak, s.rank_position
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       LEFT JOIN user_stats s ON u.id = s.user_id
       WHERE u.id = ?`,
      [userId]
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const profile = {
      ...user,
      skills: user.skills ? JSON.parse(user.skills) : []
    };

    delete profile.password_hash;
    delete profile.refresh_token;

    res.json(profile);

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, bio, skills, experienceLevel, githubUrl, linkedinUrl } = req.body;

    // Update user basic info
    if (name) {
      await query(
        'UPDATE users SET name = ?, updated_at = NOW() WHERE id = ?',
        [name, userId]
      );
    }

    // Update profile
    await query(
      `UPDATE user_profiles SET 
       bio = COALESCE(?, bio),
       skills = COALESCE(?, skills),
       experience_level = COALESCE(?, experience_level),
       github_url = COALESCE(?, github_url),
       linkedin_url = COALESCE(?, linkedin_url),
       updated_at = NOW()
       WHERE user_id = ?`,
      [
        bio,
        skills ? JSON.stringify(skills) : null,
        experienceLevel,
        githubUrl,
        linkedinUrl,
        userId
      ]
    );

    res.json({ message: 'Profile updated successfully' });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [stats] = await query(
      `SELECT s.*, u.name, u.created_at as join_date
       FROM user_stats s
       JOIN users u ON s.user_id = u.id
       WHERE s.user_id = ?`,
      [userId]
    );

    if (!stats) {
      return res.status(404).json({ message: 'Stats not found' });
    }

    // Get recent submissions
    const recentSubmissions = await query(
      `SELECT sq.title, sq.difficulty, s.status, s.score, s.submitted_at
       FROM submissions s
       JOIN dsa_questions sq ON s.question_id = sq.question_id
       WHERE s.user_id = ?
       ORDER BY s.submitted_at DESC
       LIMIT 10`,
      [userId]
    );

    // Get skill breakdown (mock data - implement based on submission analysis)
    const skillBreakdown = [
      { skill: 'Arrays', level: 3, xp: 150, maxXp: 200 },
      { skill: 'Dynamic Programming', level: 2, xp: 80, maxXp: 150 },
      { skill: 'Trees', level: 4, xp: 320, maxXp: 400 },
      { skill: 'Graphs', level: 1, xp: 45, maxXp: 100 }
    ];

    // Get weekly progress (mock data)
    const weeklyProgress = [
      { day: 'Mon', problems: 2, xp: 35 },
      { day: 'Tue', problems: 1, xp: 10 },
      { day: 'Wed', problems: 3, xp: 65 },
      { day: 'Thu', problems: 0, xp: 0 },
      { day: 'Fri', problems: 2, xp: 50 },
      { day: 'Sat', problems: 1, xp: 25 },
      { day: 'Sun', problems: 2, xp: 40 }
    ];

    // Get achievements (mock data)
    const achievements = [
      {
        id: '1',
        title: 'First Steps',
        description: 'Solved your first problem',
        earnedDate: stats.join_date,
        icon: '🎯'
      },
      {
        id: '2',
        title: 'Problem Solver',
        description: 'Solved 10 problems',
        earnedDate: new Date().toISOString(),
        icon: '🧩'
      }
    ];

    // Get recent activity
    const recentActivity = recentSubmissions.map(sub => ({
      type: 'problem_solved',
      description: `Solved "${sub.title}" (${sub.difficulty})`,
      xp: sub.status === 'Accepted' ? calculateXP(sub.difficulty) : 0,
      timestamp: sub.submitted_at
    }));

    res.json({
      ...stats,
      recentSubmissions,
      skillBreakdown,
      weeklyProgress,
      achievements,
      recentActivity
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const { type = 'global', limit = 50 } = req.query;
    
    let timeFilter = '';
    if (type === 'weekly') {
      timeFilter = 'AND s.submitted_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
    } else if (type === 'monthly') {
      timeFilter = 'AND s.submitted_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
    }

    // Get leaderboard data
    const leaderboard = await query(
      `SELECT u.id, u.name, us.total_xp, us.problems_solved, 
              us.current_streak, us.rank_position,
              COUNT(CASE WHEN s.status = 'Accepted' ${timeFilter} THEN 1 END) as period_solved,
              SUM(CASE WHEN s.status = 'Accepted' ${timeFilter} THEN 
                CASE sq.difficulty 
                  WHEN 'Easy' THEN 10 
                  WHEN 'Medium' THEN 25 
                  WHEN 'Hard' THEN 50 
                  ELSE 10 
                END 
              ELSE 0 END) as period_xp
       FROM users u
       JOIN user_stats us ON u.id = us.user_id
       LEFT JOIN submissions s ON u.id = s.user_id
       LEFT JOIN dsa_questions sq ON s.question_id = sq.question_id
       WHERE u.role = 'student'
       GROUP BY u.id, u.name, us.total_xp, us.problems_solved, us.current_streak
       ORDER BY ${type === 'global' ? 'us.total_xp' : 'period_xp'} DESC
       LIMIT ?`,
      [limit]
    );

    // Add rank and badges
    const leaderboardWithRanks = leaderboard.map((user, index) => {
      const badges = [];
      if (user.current_streak >= 7) badges.push('🔥');
      if (user.problems_solved >= 100) badges.push('💯');
      if (user.total_xp >= 1000) badges.push('⭐');

      return {
        ...user,
        rank: index + 1,
        level: Math.floor(user.total_xp / 100) + 1,
        badges,
        weeklyXP: type === 'weekly' ? user.period_xp : 0,
        monthlyXP: type === 'monthly' ? user.period_xp : 0
      };
    });

    // Get current user's rank
    const currentUserId = req.user?.id;
    let userRank = null;
    
    if (currentUserId) {
      const userIndex = leaderboardWithRanks.findIndex(u => u.id === currentUserId);
      if (userIndex !== -1) {
        userRank = {
          global: userIndex + 1,
          weekly: userIndex + 1,
          monthly: userIndex + 1,
          college: userIndex + 1 // Simplified
        };
        leaderboardWithRanks[userIndex].isCurrentUser = true;
      }
    }

    res.json({
      [type]: leaderboardWithRanks,
      userRank: userRank || { global: 999, weekly: 999, monthly: 999, college: 999 }
    });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Helper function
const calculateXP = (difficulty) => {
  const xpMap = {
    'Easy': 10,
    'Medium': 25,
    'Hard': 50
  };
  return xpMap[difficulty] || 10;
};

module.exports = {
  getProfile,
  updateProfile,
  getStats,
  getLeaderboard
};

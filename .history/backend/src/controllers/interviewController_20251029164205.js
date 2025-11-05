const { query } = require('../config/mysql');
const { v4: uuidv4 } = require('uuid');

const startInterview = async (req, res) => {
  try {
    const { type, difficulty = 'Medium', role = 'Software Engineer' } = req.body;
    const userId = req.user.id;

    if (!type || !['technical', 'behavioral', 'system_design'].includes(type)) {
      return res.status(400).json({ message: 'Valid interview type is required' });
    }

    // Generate session ID
    const sessionId = uuidv4();

    // Generate questions based on type (mock - integrate with AI service)
    let questions = [];
    
    if (type === 'technical') {
      questions = [
        {
          id: '1',
          type: 'technical',
          question: 'Implement a function to reverse a linked list iteratively and recursively.',
          expectedDuration: 20,
          difficulty: difficulty,
          category: 'Data Structures'
        },
        {
          id: '2',
          type: 'technical',
          question: 'Given an array of integers, find two numbers that add up to a target sum.',
          expectedDuration: 15,
          difficulty: difficulty,
          category: 'Algorithms'
        },
        {
          id: '3',
          type: 'technical',
          question: 'Design and implement a LRU (Least Recently Used) cache.',
          expectedDuration: 25,
          difficulty: difficulty,
          category: 'System Design'
        }
      ];
    } else if (type === 'behavioral') {
      questions = [
        {
          id: '1',
          type: 'behavioral',
          question: 'Tell me about a time when you had to work with a difficult team member.',
          expectedDuration: 180,
          category: 'Teamwork'
        },
        {
          id: '2',
          type: 'behavioral',
          question: 'Describe a situation where you had to learn something new quickly.',
          expectedDuration: 180,
          category: 'Learning Agility'
        },
        {
          id: '3',
          type: 'behavioral',
          question: 'Give me an example of a goal you set and how you achieved it.',
          expectedDuration: 180,
          category: 'Goal Setting'
        }
      ];
    } else if (type === 'system_design') {
      questions = [
        {
          id: '1',
          type: 'system_design',
          question: 'Design a URL shortening service like bit.ly that can handle millions of URLs.',
          expectedDuration: 2700,
          difficulty: difficulty,
          category: 'Web Systems'
        },
        {
          id: '2',
          type: 'system_design',
          question: 'Design a chat application like WhatsApp that supports real-time messaging.',
          expectedDuration: 2700,
          difficulty: difficulty,
          category: 'Real-time Systems'
        }
      ];
    }

    // Create interview session
    await query(
      `INSERT INTO interview_sessions (id, user_id, session_type, status, questions, started_at) 
       VALUES (?, ?, ?, 'in_progress', ?, NOW())`,
      [sessionId, userId, type, JSON.stringify(questions)]
    );

    res.status(201).json({
      id: sessionId,
      type,
      status: 'in_progress',
      questions,
      currentQuestionIndex: 0,
      answers: [],
      startTime: new Date().toISOString()
    });

  } catch (error) {
    console.error('Start interview error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const submitAnswer = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { answer, questionIndex } = req.body;
    const userId = req.user.id;

    if (!answer || questionIndex === undefined) {
      return res.status(400).json({ message: 'Answer and question index are required' });
    }

    // Get session
    const sessions = await query(
      'SELECT * FROM interview_sessions WHERE id = ? AND user_id = ?',
      [sessionId, userId]
    );

    if (sessions.length === 0) {
      return res.status(404).json({ message: 'Interview session not found' });
    }

    const session = sessions;
    const questions = JSON.parse(session.questions);
    const currentAnswers = JSON.parse(session.answers || '[]');

    // Add/update answer
    currentAnswers[questionIndex] = {
      questionId: questions[questionIndex].id,
      answer,
      submittedAt: new Date().toISOString()
    };

    // Update session
    await query(
      'UPDATE interview_sessions SET answers = ?, updated_at = NOW() WHERE id = ?',
      [JSON.stringify(currentAnswers), sessionId]
    );

    res.json({
      message: 'Answer submitted successfully',
      questionIndex,
      totalQuestions: questions.length
    });

  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const completeInterview = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    // Get session
    const sessions = await query(
      'SELECT * FROM interview_sessions WHERE id = ? AND user_id = ?',
      [sessionId, userId]
    );

    if (sessions.length === 0) {
      return res.status(404).json({ message: 'Interview session not found' });
    }

    const session = sessions;
    const questions = JSON.parse(session.questions);
    const answers = JSON.parse(session.answers || '[]');

    // Calculate duration
    const startTime = new Date(session.started_at);
    const endTime = new Date();
    const duration = Math.floor((endTime - startTime) / 1000); // in seconds

    // Generate mock feedback (integrate with AI service in production)
    const feedback = generateMockFeedback(session.session_type, questions, answers);

    // Update session
    await query(
      `UPDATE interview_sessions SET 
       status = 'completed', 
       completed_at = NOW(), 
       duration = ?, 
       feedback = ?, 
       score = ? 
       WHERE id = ?`,
      [duration, JSON.stringify(feedback), feedback.overallScore, sessionId]
    );

    res.json({
      message: 'Interview completed successfully',
      feedback,
      duration,
      score: feedback.overallScore
    });

  } catch (error) {
    console.error('Complete interview error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getInterviewHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, offset = 0 } = req.query;

    const interviews = await query(
      `SELECT id, session_type, status, score, duration, started_at, completed_at
       FROM interview_sessions 
       WHERE user_id = ? 
       ORDER BY started_at DESC 
       LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    res.json({
      interviews: interviews.map(interview => ({
        ...interview,
        sessionType: interview.session_type,
        startedAt: interview.started_at,
        completedAt: interview.completed_at
      })),
      hasMore: interviews.length === parseInt(limit)
    });

  } catch (error) {
    console.error('Get interview history error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getInterviewDetails = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const sessions = await query(
      'SELECT * FROM interview_sessions WHERE id = ? AND user_id = ?',
      [sessionId, userId]
    );

    if (sessions.length === 0) {
      return res.status(404).json({ message: 'Interview session not found' });
    }

    const session = sessions;

    res.json({
      id: session.id,
      type: session.session_type,
      status: session.status,
      questions: JSON.parse(session.questions || '[]'),
      answers: JSON.parse(session.answers || '[]'),
      feedback: JSON.parse(session.feedback || '{}'),
      score: session.score,
      duration: session.duration,
      startedAt: session.started_at,
      completedAt: session.completed_at
    });

  } catch (error) {
    console.error('Get interview details error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Helper function to generate mock feedback
const generateMockFeedback = (type, questions, answers) => {
  const answeredCount = answers.length;
  const totalCount = questions.length;
  const completionRate = (answeredCount / totalCount) * 100;

  let baseScore = Math.floor(completionRate * 0.6); // 60% for completion
  
  // Add random performance score
  const performanceScore = Math.floor(Math.random() * 40) + 20; // 20-60
  const overallScore = Math.min(baseScore + performanceScore, 100);

  const feedback = {
    overallScore,
    breakdown: {
      completion: completionRate,
      technical: type === 'technical' ? performanceScore + 10 : null,
      communication: performanceScore,
      problemSolving: type !== 'behavioral' ? performanceScore + 5 : null
    },
    strengths: [
      'Good problem-solving approach',
      'Clear communication',
      'Structured thinking'
    ],
    improvements: [
      'Consider edge cases more thoroughly',
      'Provide more detailed explanations',
      'Practice time management'
    ],
    detailedFeedback: `You demonstrated solid understanding of the concepts with a completion rate of ${completionRate.toFixed(1)}%. Your approach to problem-solving shows potential, and with more practice, you can improve your performance significantly.`,
    recommendations: [
      'Practice more coding problems daily',
      'Focus on explaining your thought process',
      'Review common algorithms and data structures'
    ]
  };

  return feedback;
};

module.exports = {
  startInterview,
  submitAnswer,
  completeInterview,
  getInterviewHistory,
  getInterviewDetails
};

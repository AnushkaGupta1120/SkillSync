const jwt = require('jsonwebtoken');
const { query } = require('../config/mysql');

const socketHandler = (io) => {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const users = await query(
        'SELECT id, name, email, role FROM users WHERE id = ?',
        [decoded.userId]
      );

      if (users.length === 0) {
        return next(new Error('User not found'));
      }

      socket.user = users;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.name} connected: ${socket.id}`);

    // Join user to their personal room
    socket.join(`user_${socket.user.id}`);

    // Join role-based rooms
    socket.join(`role_${socket.user.role}`);

    // Handle interview sessions
    socket.on('join_interview', async (sessionId) => {
      try {
        // Verify user has access to this interview session
        const sessions = await query(
          'SELECT id FROM interview_sessions WHERE id = ? AND user_id = ?',
          [sessionId, socket.user.id]
        );

        if (sessions.length > 0) {
          socket.join(`interview_${sessionId}`);
          socket.emit('interview_joined', { sessionId });
          
          // Notify others in the interview room
          socket.to(`interview_${sessionId}`).emit('user_joined_interview', {
            userId: socket.user.id,
            userName: socket.user.name
          });
        } else {
          socket.emit('error', { message: 'Access denied to interview session' });
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to join interview' });
      }
    });

    socket.on('leave_interview', (sessionId) => {
      socket.leave(`interview_${sessionId}`);
      socket.to(`interview_${sessionId}`).emit('user_left_interview', {
        userId: socket.user.id,
        userName: socket.user.name
      });
    });

    // Handle code editor collaboration
    socket.on('code_change', (data) => {
      const { sessionId, code, language, cursorPosition } = data;
      
      // Broadcast code changes to others in the same session
      socket.to(`interview_${sessionId}`).emit('code_update', {
        userId: socket.user.id,
        userName: socket.user.name,
        code,
        language,
        cursorPosition,
        timestamp: new Date().toISOString()
      });
    });

    // Handle real-time leaderboard updates
    socket.on('join_leaderboard', () => {
      socket.join('leaderboard');
    });

    socket.on('leave_leaderboard', () => {
      socket.leave('leaderboard');
    });

    // Handle problem submission events
    socket.on('submission_update', async (data) => {
      const { questionId, status, score } = data;
      
      // Broadcast to leaderboard room if accepted
      if (status === 'Accepted') {
        io.to('leaderboard').emit('leaderboard_update', {
          userId: socket.user.id,
          userName: socket.user.name,
          questionId,
          score,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Handle recruiter-student interactions
    socket.on('join_recruiter_dashboard', () => {
      if (socket.user.role === 'recruiter') {
        socket.join('recruiter_dashboard');
      }
    });

    socket.on('candidate_activity', (data) => {
      // Notify recruiters about candidate activities
      io.to('recruiter_dashboard').emit('candidate_update', {
        candidateId: data.candidateId,
        activity: data.activity,
        timestamp: new Date().toISOString()
      });
    });

    // Handle notifications
    socket.on('join_notifications', () => {
      socket.join(`notifications_${socket.user.id}`);
    });

    // Handle typing indicators for interviews
    socket.on('typing_start', (data) => {
      const { sessionId } = data;
      socket.to(`interview_${sessionId}`).emit('user_typing', {
        userId: socket.user.id,
        userName: socket.user.name
      });
    });

    socket.on('typing_stop', (data) => {
      const { sessionId } = data;
      socket.to(`interview_${sessionId}`).emit('user_stop_typing', {
        userId: socket.user.id,
        userName: socket.user.name
      });
    });

    // Handle voice/video call signaling for interviews
    socket.on('call_offer', (data) => {
      const { sessionId, offer } = data;
      socket.to(`interview_${sessionId}`).emit('call_offer', {
        userId: socket.user.id,
        offer
      });
    });

    socket.on('call_answer', (data) => {
      const { sessionId, answer } = data;
      socket.to(`interview_${sessionId}`).emit('call_answer', {
        userId: socket.user.id,
        answer
      });
    });

    socket.on('ice_candidate', (data) => {
      const { sessionId, candidate } = data;
      socket.to(`interview_${sessionId}`).emit('ice_candidate', {
        userId: socket.user.id,
        candidate
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.name} disconnected: ${socket.id}`);
      
      // Notify interview rooms about disconnection
      socket.rooms.forEach(room => {
        if (room.startsWith('interview_')) {
          socket.to(room).emit('user_disconnected', {
            userId: socket.user.id,
            userName: socket.user.name
          });
        }
      });
    });

    // Error handling
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.user.id}:`, error);
    });
  });

  // Helper function to send notifications to specific users
  const sendNotificationToUser = (userId, notification) => {
    io.to(`notifications_${userId}`).emit('notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });
  };

  // Helper function to update leaderboard
  const updateLeaderboard = async () => {
    try {
      const leaderboard = await query(`
        SELECT u.id, u.name, s.total_xp, s.problems_solved, s.current_streak
        FROM users u
        JOIN user_stats s ON u.id = s.user_id
        WHERE u.role = 'student'
        ORDER BY s.total_xp DESC
        LIMIT 10
      `);

      io.to('leaderboard').emit('leaderboard_refresh', { leaderboard });
    } catch (error) {
      console.error('Error updating leaderboard:', error);
    }
  };

  // Export helper functions for use in controllers
  return {
    sendNotificationToUser,
    updateLeaderboard,
    io
  };
};

module.exports = { socketHandler };

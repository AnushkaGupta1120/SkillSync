const express = require('express');
const { 
  startInterview, 
  submitAnswer, 
  completeInterview, 
  getInterviewHistory, 
  getInterviewDetails 
} = require('../controllers/interviewController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { 
  validateInterviewStart, 
  validateInterviewAnswer,
  validatePagination,
  validateUUID 
} = require('../middleware/validationMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Interview management
router.post('/start', validateInterviewStart, startInterview);
router.post('/:sessionId/answer', validateInterviewAnswer, submitAnswer);
router.post('/:sessionId/complete', validateUUID, completeInterview);

// Interview history and details
router.get('/history', validatePagination, getInterviewHistory);
router.get('/:sessionId', validateUUID, getInterviewDetails);

module.exports = router;

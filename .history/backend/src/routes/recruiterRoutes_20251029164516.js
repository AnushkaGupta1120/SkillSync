const express = require('express');
const { 
  getCandidates, 
  getCandidateDetails, 
  scheduleInterview, 
  getScheduledInterviews, 
  updateInterviewStatus, 
  getCandidateAnalytics 
} = require('../controllers/recruiterController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');
const { 
  validateCandidateSearch,
  validateScheduleInterview,
  validatePagination,
  validateId 
} = require('../middleware/validationMiddleware');

const router = express.Router();

// All routes require authentication and recruiter role
router.use(authenticateToken);
router.use(requireRole(['recruiter', 'admin']));

// Candidate management
router.get('/candidates', validateCandidateSearch, getCandidates);
router.get('/candidates/:candidateId', validateId, getCandidateDetails);

// Interview management
router.post('/candidates/:candidateId/interview', validateScheduleInterview, scheduleInterview);
router.get('/interviews', validatePagination, getScheduledInterviews);
router.put('/interviews/:sessionId/status', updateInterviewStatus);

// Analytics
router.get('/analytics', getCandidateAnalytics);

module.exports = router;

const express = require('express');
const { 
  getQuestions, 
  getQuestion, 
  submitSolution, 
  getHint, 
  runCode 
} = require('../controllers/dsaController');
const { authenticateToken, optionalAuth } = require('../middleware/authMiddleware');
const { 
  validateDSASubmission, 
  validatePagination,
  validateId 
} = require('../middleware/validationMiddleware');

const router = express.Router();

// Public routes (optional auth for personalization)
router.get('/questions', optionalAuth, validatePagination, getQuestions);
router.get('/questions/:id', optionalAuth, validateId, getQuestion);

// Protected routes (require authentication)
router.post('/submit', authenticateToken, validateDSASubmission, submitSolution);
router.post('/hint', authenticateToken, getHint);
router.post('/run', authenticateToken, runCode);

module.exports = router;

const express = require('express');
const { 
  analyzeResume, 
  getAnalysisHistory, 
  getAnalysisDetails, 
  optimizeResume, 
  downloadAnalysisReport 
} = require('../controllers/resumeController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { 
  validateResumeOptimization,
  validatePagination,
  validateId 
} = require('../middleware/validationMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Resume analysis
router.post('/analyze', analyzeResume);
router.get('/history', validatePagination, getAnalysisHistory);
router.get('/analysis/:analysisId', validateId, getAnalysisDetails);

// Resume optimization
router.post('/analysis/:analysisId/optimize', validateId, validateResumeOptimization, optimizeResume);

// Report download
router.get('/analysis/:analysisId/download', validateId, downloadAnalysisReport);

module.exports = router;

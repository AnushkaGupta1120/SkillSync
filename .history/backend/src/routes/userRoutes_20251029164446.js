const express = require('express');
const { 
  getProfile, 
  updateProfile, 
  getStats, 
  getLeaderboard 
} = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { 
  validateProfileUpdate, 
  validatePagination 
} = require('../middleware/validationMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', validateProfileUpdate, updateProfile);

// Stats routes
router.get('/stats', getStats);

// Leaderboard routes
router.get('/leaderboard', validatePagination, getLeaderboard);

module.exports = router;

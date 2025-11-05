const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const dsaRoutes = require('./dsaRoutes');
const interviewRoutes = require('./interviewRoutes');
const resumeRoutes = require('./resumeRoutes');
const recruiterRoutes = require('./recruiterRoutes');
const adminRoutes = require('./adminRoutes');

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: 'MySQL'
  });
});

// Route modules
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/dsa', dsaRoutes);
router.use('/interview', interviewRoutes);
router.use('/resume', resumeRoutes);
router.use('/recruiter', recruiterRoutes);
router.use('/admin', adminRoutes);

module.exports = router;

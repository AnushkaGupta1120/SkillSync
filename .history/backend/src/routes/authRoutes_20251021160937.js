const express = require('express');
const { register, login, refreshToken, logout, verifyToken } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { validateRegistration, validateLogin } = require('../middleware/validationMiddleware');

const router = express.Router();

router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/refresh', refreshToken);
router.post('/logout', authenticateToken, logout);
router.get('/verify', authenticateToken, verifyToken);

module.exports = router;

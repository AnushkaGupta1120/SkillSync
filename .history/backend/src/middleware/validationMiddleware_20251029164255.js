const { validationResult, body, param, query } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Registration validation
const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('role')
    .optional()
    .isIn(['student', 'recruiter', 'admin'])
    .withMessage('Role must be student, recruiter, or admin'),
  
  handleValidationErrors
];

// Login validation
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Profile update validation
const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),
  
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  
  body('skills.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each skill must be between 1 and 50 characters'),
  
  body('experienceLevel')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Experience level must be beginner, intermediate, advanced, or expert'),
  
  body('githubUrl')
    .optional()
    .isURL()
    .withMessage('GitHub URL must be a valid URL'),
  
  body('linkedinUrl')
    .optional()
    .isURL()
    .withMessage('LinkedIn URL must be a valid URL'),
  
  handleValidationErrors
];

// DSA submission validation
const validateDSASubmission = [
  body('questionId')
    .notEmpty()
    .withMessage('Question ID is required'),
  
  body('code')
    .notEmpty()
    .withMessage('Code is required')
    .isLength({ max: 10000 })
    .withMessage('Code must not exceed 10000 characters'),
  
  body('language')
    .isIn(['javascript', 'python', 'java', 'cpp', 'c'])
    .withMessage('Language must be one of: javascript, python, java, cpp, c'),
  
  handleValidationErrors
];

// Interview session validation
const validateInterviewStart = [
  body('type')
    .isIn(['technical', 'behavioral', 'system_design'])
    .withMessage('Interview type must be technical, behavioral, or system_design'),
  
  body('difficulty')
    .optional()
    .isIn(['Easy', 'Medium', 'Hard'])
    .withMessage('Difficulty must be Easy, Medium, or Hard'),
  
  body('role')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Role must be between 2 and 100 characters'),
  
  handleValidationErrors
];

// Interview answer validation
const validateInterviewAnswer = [
  param('sessionId')
    .isUUID()
    .withMessage('Invalid session ID'),
  
  body('answer')
    .notEmpty()
    .withMessage('Answer is required')
    .isLength({ max: 5000 })
    .withMessage('Answer must not exceed 5000 characters'),
  
  body('questionIndex')
    .isInt({ min: 0 })
    .withMessage('Question index must be a non-negative integer'),
  
  handleValidationErrors
];

// Recruiter candidate search validation
const validateCandidateSearch = [
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term must not exceed 100 characters'),
  
  query('skills')
    .optional()
    .matches(/^[a-zA-Z0-9,\s]+$/)
    .withMessage('Skills must contain only letters, numbers, commas, and spaces'),
  
  query('experienceLevel')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Experience level must be beginner, intermediate, advanced, or expert'),
  
  query('minAtsScore')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Minimum ATS score must be between 0 and 100'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be non-negative'),
  
  query('sortBy')
    .optional()
    .isIn(['name', 'created_at', 'total_xp', 'ats_score', 'avg_interview_score'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('Sort order must be ASC or DESC'),
  
  handleValidationErrors
];

// Schedule interview validation
const validateScheduleInterview = [
  param('candidateId')
    .isInt({ min: 1 })
    .withMessage('Invalid candidate ID'),
  
  body('interviewType')
    .isIn(['technical', 'behavioral', 'system_design'])
    .withMessage('Interview type must be technical, behavioral, or system_design'),
  
  body('scheduledDate')
    .isISO8601()
    .toDate()
    .withMessage('Scheduled date must be a valid ISO 8601 date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Scheduled date must be in the future');
      }
      return true;
    }),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),
  
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be non-negative'),
  
  handleValidationErrors
];

// ID parameter validation
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid ID'),
  
  handleValidationErrors
];

// UUID parameter validation
const validateUUID = [
  param('sessionId')
    .isUUID()
    .withMessage('Invalid session ID'),
  
  handleValidationErrors
];

// Resume optimization validation
const validateResumeOptimization = [
  body('targetRole')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Target role must be between 2 and 100 characters'),
  
  body('jobDescription')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Job description must not exceed 5000 characters'),
  
  body('focusAreas')
    .optional()
    .isArray()
    .withMessage('Focus areas must be an array'),
  
  body('focusAreas.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each focus area must be between 1 and 50 characters'),
  
  handleValidationErrors
];

// Admin user management validation
const validateUserManagement = [
  body('role')
    .optional()
    .isIn(['student', 'recruiter', 'admin'])
    .withMessage('Role must be student, recruiter, or admin'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended'])
    .withMessage('Status must be active, inactive, or suspended'),
  
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  validateDSASubmission,
  validateInterviewStart,
  validateInterviewAnswer,
  validateCandidateSearch,
  validateScheduleInterview,
  validatePagination,
  validateId,
  validateUUID,
  validateResumeOptimization,
  validateUserManagement,
  handleValidationErrors
};

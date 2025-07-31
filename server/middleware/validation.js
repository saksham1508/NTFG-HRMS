const { body, param, query, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('profile.firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  
  body('profile.lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  
  body('profile.phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('role')
    .isIn(['admin', 'hr', 'manager', 'employee'])
    .withMessage('Role must be one of: admin, hr, manager, employee'),
  
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

const validateUserUpdate = [
  body('profile.firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  
  body('profile.lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  
  body('profile.phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  handleValidationErrors
];

// Employee validation rules
const validateEmployee = [
  body('employment.employeeId')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Employee ID must be between 3 and 20 characters')
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('Employee ID can only contain uppercase letters, numbers, and hyphens'),
  
  body('employment.department')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Department must be between 2 and 50 characters'),
  
  body('employment.position')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Position must be between 2 and 100 characters'),
  
  body('employment.startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  body('employment.salary')
    .optional()
    .isNumeric()
    .withMessage('Salary must be a number')
    .custom((value) => {
      if (value < 0) {
        throw new Error('Salary cannot be negative');
      }
      return true;
    }),
  
  body('employment.status')
    .isIn(['active', 'inactive', 'terminated', 'on_leave'])
    .withMessage('Status must be one of: active, inactive, terminated, on_leave'),
  
  handleValidationErrors
];

// Job posting validation rules
const validateJobPosting = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Job title must be between 5 and 100 characters'),
  
  body('department')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Department must be between 2 and 50 characters'),
  
  body('location')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),
  
  body('type')
    .isIn(['full-time', 'part-time', 'contract', 'internship'])
    .withMessage('Job type must be one of: full-time, part-time, contract, internship'),
  
  body('description')
    .trim()
    .isLength({ min: 50, max: 5000 })
    .withMessage('Job description must be between 50 and 5000 characters'),
  
  body('requirements')
    .isArray({ min: 1 })
    .withMessage('At least one requirement is needed'),
  
  body('requirements.*')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Each requirement must be between 5 and 500 characters'),
  
  body('responsibilities')
    .isArray({ min: 1 })
    .withMessage('At least one responsibility is needed'),
  
  body('responsibilities.*')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Each responsibility must be between 5 and 500 characters'),
  
  body('salaryRange.min')
    .optional()
    .isNumeric()
    .withMessage('Minimum salary must be a number')
    .custom((value) => {
      if (value < 0) {
        throw new Error('Minimum salary cannot be negative');
      }
      return true;
    }),
  
  body('salaryRange.max')
    .optional()
    .isNumeric()
    .withMessage('Maximum salary must be a number')
    .custom((value, { req }) => {
      if (value < 0) {
        throw new Error('Maximum salary cannot be negative');
      }
      if (req.body.salaryRange?.min && value < req.body.salaryRange.min) {
        throw new Error('Maximum salary must be greater than minimum salary');
      }
      return true;
    }),
  
  body('applicationDeadline')
    .isISO8601()
    .withMessage('Application deadline must be a valid date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Application deadline must be in the future');
      }
      return true;
    }),
  
  body('requiredSkills')
    .optional()
    .isArray()
    .withMessage('Required skills must be an array'),
  
  body('requiredSkills.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each skill must be between 1 and 50 characters'),
  
  body('experienceLevel')
    .isIn(['entry', 'mid-level', 'senior', 'executive'])
    .withMessage('Experience level must be one of: entry, mid-level, senior, executive'),
  
  body('isRemote')
    .optional()
    .isBoolean()
    .withMessage('Remote flag must be a boolean'),
  
  handleValidationErrors
];

// Application validation rules
const validateApplication = [
  body('applicantName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Applicant name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Applicant name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('phone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('coverLetter')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Cover letter cannot exceed 2000 characters'),
  
  body('experience')
    .optional()
    .isNumeric()
    .withMessage('Experience must be a number')
    .custom((value) => {
      if (value < 0 || value > 50) {
        throw new Error('Experience must be between 0 and 50 years');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Leave request validation rules
const validateLeaveRequest = [
  body('type')
    .isIn(['annual', 'sick', 'personal', 'maternity', 'paternity', 'emergency'])
    .withMessage('Leave type must be one of: annual, sick, personal, maternity, paternity, emergency'),
  
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Start date cannot be in the past');
      }
      return true;
    }),
  
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  body('reason')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters'),
  
  body('isHalfDay')
    .optional()
    .isBoolean()
    .withMessage('Half day flag must be a boolean'),
  
  handleValidationErrors
];

// Performance review validation rules
const validatePerformanceReview = [
  body('reviewPeriod.start')
    .isISO8601()
    .withMessage('Review period start must be a valid date'),
  
  body('reviewPeriod.end')
    .isISO8601()
    .withMessage('Review period end must be a valid date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.reviewPeriod.start)) {
        throw new Error('Review period end must be after start date');
      }
      return true;
    }),
  
  body('overallRating')
    .isNumeric()
    .withMessage('Overall rating must be a number')
    .custom((value) => {
      if (value < 1 || value > 5) {
        throw new Error('Overall rating must be between 1 and 5');
      }
      return true;
    }),
  
  body('goals')
    .optional()
    .isArray()
    .withMessage('Goals must be an array'),
  
  body('achievements')
    .optional()
    .isArray()
    .withMessage('Achievements must be an array'),
  
  body('areasForImprovement')
    .optional()
    .isArray()
    .withMessage('Areas for improvement must be an array'),
  
  body('comments')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Comments cannot exceed 2000 characters'),
  
  handleValidationErrors
];

// Parameter validation
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  
  handleValidationErrors
];

// Query validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sort')
    .optional()
    .isIn(['createdAt', '-createdAt', 'name', '-name', 'email', '-email'])
    .withMessage('Invalid sort field'),
  
  handleValidationErrors
];

const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  
  query('department')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Department filter must be between 1 and 50 characters'),
  
  query('role')
    .optional()
    .isIn(['admin', 'hr', 'manager', 'employee'])
    .withMessage('Role filter must be one of: admin, hr, manager, employee'),
  
  query('status')
    .optional()
    .isIn(['active', 'inactive', 'terminated', 'on_leave'])
    .withMessage('Status filter must be one of: active, inactive, terminated, on_leave'),
  
  handleValidationErrors
];

// AI-specific validation
const validateResumeAnalysis = [
  body('jobRequirements')
    .optional()
    .isArray()
    .withMessage('Job requirements must be an array'),
  
  body('jobRequirements.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Each job requirement must be between 1 and 100 characters'),
  
  handleValidationErrors
];

const validateChatbotMessage = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  
  body('conversationId')
    .optional()
    .isUUID()
    .withMessage('Conversation ID must be a valid UUID'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateEmployee,
  validateJobPosting,
  validateApplication,
  validateLeaveRequest,
  validatePerformanceReview,
  validateObjectId,
  validatePagination,
  validateSearch,
  validateResumeAnalysis,
  validateChatbotMessage
};
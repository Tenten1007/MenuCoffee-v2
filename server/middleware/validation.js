const { body, param, query, validationResult } = require('express-validator');

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// Coffee validation rules
const validateCoffee = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Name must be between 1 and 255 characters')
    .matches(/^[a-zA-Z0-9\s\u0E00-\u0E7F]+$/)
    .withMessage('Name contains invalid characters'),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('category')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\u0E00-\u0E7F-]+$/)
    .withMessage('Category contains invalid characters'),
  
  body('has_options')
    .optional()
    .toBoolean()
    .isBoolean()
    .withMessage('has_options must be a boolean'),
  
  body('menu_options')
    .optional()
    .isArray()
    .withMessage('menu_options must be an array'),
  
  body('menu_options.*.option_type')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Option type must be between 1 and 50 characters'),
  
  body('menu_options.*.option_name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Option name must be between 1 and 100 characters'),
  
  body('menu_options.*.price_adjustment')
    .optional()
    .isFloat()
    .withMessage('Price adjustment must be a number'),
  
  handleValidationErrors
];

// Order validation rules
const validateOrder = [
  body('customerName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Customer name must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\u0E00-\u0E7F]+$/)
    .withMessage('Customer name contains invalid characters'),
  
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items must be a non-empty array'),
  
  body('items.*.name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Item name must be between 1 and 255 characters'),
  
  body('items.*.price')
    .isFloat({ min: 0 })
    .withMessage('Item price must be a positive number'),
  
  body('items.*.quantity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Item quantity must be between 1 and 100'),
  
  body('items.*.note')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Note must be less than 500 characters'),
  
  handleValidationErrors
];

// Staff validation rules
const validateStaffLogin = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  handleValidationErrors
];

// ID parameter validation
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer'),
  
  handleValidationErrors
];

// Query parameter validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

// File upload validation
const validateFileUpload = [
  body('image')
    .optional()
    .custom((value, { req }) => {
      if (!req.file) {
        throw new Error('Image file is required');
      }
      return true;
    }),
  
  handleValidationErrors
];

module.exports = {
  validateCoffee,
  validateOrder,
  validateStaffLogin,
  validateId,
  validatePagination,
  validateFileUpload,
  handleValidationErrors
}; 
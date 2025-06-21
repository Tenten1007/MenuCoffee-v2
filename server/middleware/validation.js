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
    .optional({ checkFalsy: true })
    .isFloat({ gt: -1 })
    .withMessage('Price must be a number greater than or equal to 0'),
  
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
  
  body('base_price')
    .optional({ checkFalsy: true })
    .isFloat({ gt: -1 })
    .withMessage('Base price must be a number greater than or equal to 0'),
  
  body('menu_options')
    .optional()
    .custom((value, { req }) => {
      // If has_options is not true, we don't need to validate menu_options
      if (req.body.has_options !== 'true' && req.body.has_options !== true) {
        return true;
      }
      
      if (!value) {
        // If has_options is true, menu_options can be an empty array but not missing
        return true;
      }
      
      let options;
      try {
        options = JSON.parse(value);
      } catch (e) {
        throw new Error('menu_options must be a valid JSON string');
      }

      if (!Array.isArray(options)) {
        throw new Error('menu_options must be an array of objects');
      }

      for (const option of options) {
        if (typeof option !== 'object' || option === null) {
          throw new Error('Each item in menu_options must be an object');
        }
        if (!option.option_type || typeof option.option_type !== 'string' || !/^[a-zA-Z0-9\s-]+$/.test(option.option_type)) {
          throw new Error('Invalid option_type in menu_options');
        }
        if (!option.option_name || typeof option.option_name !== 'string' || !/^[a-zA-Z0-9\s\u0E00-\u0E7F'._()/-]+$/.test(option.option_name)) {
          throw new Error('Invalid option_name in menu_options. It may contain invalid characters.');
        }
        if (option.price_adjustment === undefined || typeof option.price_adjustment !== 'number') {
          throw new Error('Invalid or missing price_adjustment in menu_options');
        }
        if (option.is_available === undefined || (typeof option.is_available !== 'boolean' && option.is_available !== 0 && option.is_available !== 1)) {
          throw new Error('Invalid or missing is_available in menu_options. Must be a boolean, 0, or 1.');
        }
      }
      return true;
    }),
  
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
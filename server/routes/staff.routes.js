const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');
const staffAuth = require('../middleware/staffAuth');
const { validateStaffLogin } = require('../middleware/validation');

// Public routes
router.post('/login', validateStaffLogin, staffController.login);
router.post('/refresh-token', staffController.refreshToken);

// Protected routes (require authentication)
router.post('/logout', staffAuth, staffController.logout);
router.post('/change-password', staffAuth, staffController.changePassword);

module.exports = router; 
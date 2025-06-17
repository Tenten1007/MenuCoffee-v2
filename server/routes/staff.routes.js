const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');

router.post('/login', staffController.login);

module.exports = router; 
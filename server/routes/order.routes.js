const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const staffAuth = require('../middleware/staffAuth');

// Public routes
router.post('/', orderController.create);
router.get('/', staffAuth, orderController.findAll);
router.get('/:id', staffAuth, orderController.findOne);
router.put('/:id', staffAuth, orderController.update);
router.delete('/:id', staffAuth, orderController.delete);

module.exports = router; 
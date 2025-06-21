const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const staffAuth = require('../middleware/staffAuth');
const { validateOrder, validateId } = require('../middleware/validation');

// Public routes
router.post('/', validateOrder, orderController.create);

// Protected routes (require authentication)
router.get('/', staffAuth, orderController.findAll);
router.get('/:id', staffAuth, validateId, orderController.findOne);
router.put('/:id', staffAuth, validateId, orderController.update);
router.delete('/:id', staffAuth, validateId, orderController.delete);
router.post('/clear-old', staffAuth, orderController.clearOldOrders);
router.get('/history', staffAuth, orderController.getOrderHistory);

module.exports = router; 
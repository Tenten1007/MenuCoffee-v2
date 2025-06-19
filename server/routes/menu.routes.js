const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu.controller');
const staffAuth = require('../middleware/staffAuth');

// Menu options routes
router.get('/options', menuController.getAllOptions);
router.get('/options/:category', menuController.getMenuOptions);
router.get('/categories', menuController.getCategories);
router.post('/options', staffAuth, menuController.addOption);
router.put('/options/:id', staffAuth, menuController.updateOption);
router.delete('/options/:id', staffAuth, menuController.deleteOption);

// ... existing code ...

module.exports = router; 
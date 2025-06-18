const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu.controller');

// Menu options routes
router.get('/options', menuController.getAllOptions);
router.get('/options/:category', menuController.getMenuOptions);
router.get('/categories', menuController.getCategories);
router.post('/options', menuController.addOption);
router.put('/options/:id', menuController.updateOption);
router.delete('/options/:id', menuController.deleteOption);

// ... existing code ...

module.exports = router; 
const express = require('express');
const router = express.Router();
const coffeeController = require('../controllers/coffee.controller');
const upload = require('../middleware/upload.middleware').default;

// Create a new coffee
router.post('/', upload.single('image'), coffeeController.create);

// Get all coffees
router.get('/', coffeeController.findAll);

// Get a single coffee with id
router.get('/:id', coffeeController.findOne);

// Update a coffee with id
router.put('/:id', upload.single('image'), coffeeController.update);

// Delete a coffee with id
router.delete('/:id', coffeeController.delete);

module.exports = router; 
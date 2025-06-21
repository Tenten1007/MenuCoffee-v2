const express = require('express');
const router = express.Router();
const coffeeController = require('../controllers/coffee.controller');
const staffAuth = require('../middleware/staffAuth');
const { validateCoffee, validateId } = require('../middleware/validation');
const { upload } = require('../config/cloudinary.config');

// Create a new coffee (requires authentication)
router.post('/', 
  staffAuth, 
  upload.single('image'),
  validateCoffee,
  coffeeController.create
);

// Get all coffees (public)
router.get('/', coffeeController.findAll);

// Get a coffee by id (public)
router.get('/:id', validateId, coffeeController.findOne);

// Update a coffee with id (requires authentication)
router.put('/:id', 
  staffAuth, 
  validateId,
  upload.single('image'),
  validateCoffee,
  coffeeController.update
);

// Delete a coffee with id (requires authentication)
router.delete('/:id', 
  staffAuth, 
  validateId,
  coffeeController.delete
);

// Get menu options for a coffee (public)
router.get('/:id/options', validateId, coffeeController.getMenuOptions);

// Add a new menu option (requires authentication)
router.post('/:id/options', 
  staffAuth, 
  validateId,
  coffeeController.addMenuOption
);

// Update a menu option (requires authentication)
router.put('/:id/options/:optionId', 
  staffAuth, 
  validateId,
  coffeeController.updateMenuOption
);

// Delete a menu option (requires authentication)
router.delete('/:id/options/:optionId', 
  staffAuth, 
  validateId,
  coffeeController.deleteMenuOption
);

module.exports = router; 
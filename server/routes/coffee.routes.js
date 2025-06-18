const express = require('express');
const router = express.Router();
const coffeeController = require('../controllers/coffee.controller');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// กำหนด path ของโฟลเดอร์ uploads
const uploadsDir = path.join(__dirname, '..', 'uploads');

// สร้างโฟลเดอร์ uploads ถ้ายังไม่มี
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Create a new coffee
router.post('/', upload.single('image'), coffeeController.create);

// Get all coffees
router.get('/', coffeeController.findAll);

// Get a coffee by id
router.get('/:id', coffeeController.findOne);

// Update a coffee with id
router.put('/:id', upload.single('image'), coffeeController.update);

// Delete a coffee with id
router.delete('/:id', coffeeController.delete);

// Get menu options for a coffee
router.get('/:id/options', coffeeController.getMenuOptions);

// Add a new menu option
router.post('/:id/options', coffeeController.addMenuOption);

// Update a menu option
router.put('/:id/options/:optionId', coffeeController.updateMenuOption);

// Delete a menu option
router.delete('/:id/options/:optionId', coffeeController.deleteMenuOption);

module.exports = router; 
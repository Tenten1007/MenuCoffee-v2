const express = require('express');
const router = express.Router();
const coffeeController = require('../controllers/coffee.controller');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const staffAuth = require('../middleware/staffAuth');

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

const filetypes = /jpeg|jpg|png|gif/;
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb('Error: Images Only!');
  }
});

// Create a new coffee
router.post('/', staffAuth, upload.single('image'), coffeeController.create);

// Get all coffees
router.get('/', coffeeController.findAll);

// Get a coffee by id
router.get('/:id', coffeeController.findOne);

// Update a coffee with id
router.put('/:id', staffAuth, upload.single('image'), coffeeController.update);

// Delete a coffee with id
router.delete('/:id', staffAuth, coffeeController.delete);

// Get menu options for a coffee
router.get('/:id/options', coffeeController.getMenuOptions);

// Add a new menu option
router.post('/:id/options', staffAuth, coffeeController.addMenuOption);

// Update a menu option
router.put('/:id/options/:optionId', staffAuth, coffeeController.updateMenuOption);

// Delete a menu option
router.delete('/:id/options/:optionId', staffAuth, coffeeController.deleteMenuOption);

module.exports = router; 
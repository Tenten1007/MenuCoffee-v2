const mysql = require('mysql2/promise');
require('dotenv').config();

// สร้าง connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Create a new coffee
exports.create = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await pool.query(
      'INSERT INTO coffees (name, description, price, category, image) VALUES (?, ?, ?, ?, ?)',
      [name, description, price, category, imagePath]
    );

    // ส่ง response กลับพร้อม URL ที่สมบูรณ์
    const fullImageUrl = imagePath ? `http://localhost:${process.env.PORT || 5000}${imagePath}` : null;
    res.status(201).json({ id: result.insertId, ...req.body, image: fullImageUrl });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Some error occurred while creating the coffee."
    });
  }
};

// Get all coffees
exports.findAll = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM coffees');
    const coffeesWithAbsoluteImageUrls = rows.map(coffee => ({
      ...coffee,
      image: coffee.image ? `http://localhost:${process.env.PORT || 5000}${coffee.image}` : null
    }));
    res.json(coffeesWithAbsoluteImageUrls);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Some error occurred while retrieving coffees."
    });
  }
};

// Get a single coffee by id
exports.findOne = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM coffees WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Coffee not found" });
    }
    const coffee = rows[0];
    coffee.image = coffee.image ? `http://localhost:${process.env.PORT || 5000}${coffee.image}` : null;
    res.json(coffee);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Error retrieving coffee with id " + req.params.id
    });
  }
};

// Update a coffee
exports.update = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    let imagePath = req.body.currentImage;

    // ถ้ามีการอัพโหลดรูปใหม่
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const [result] = await pool.query(
      'UPDATE coffees SET name = ?, description = ?, price = ?, category = ?, image = ? WHERE id = ?',
      [name, description, price, category, imagePath, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Coffee not found" });
    }

    // ส่ง response กลับพร้อม URL ที่สมบูรณ์
    const fullImageUrl = imagePath ? `http://localhost:${process.env.PORT || 5000}${imagePath}` : null;
    res.json({ 
      message: "Coffee was updated successfully.",
      coffee: {
        id: req.params.id,
        name,
        description,
        price,
        category,
        image: fullImageUrl
      }
    });
  } catch (error) {
    console.error('Error updating coffee:', error);
    res.status(500).json({
      message: error.message || "Error updating coffee with id " + req.params.id
    });
  }
};

// Delete a coffee
exports.delete = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM coffees WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Coffee not found" });
    }
    res.json({ message: "Coffee was deleted successfully!" });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Error deleting coffee with id " + req.params.id
    });
  }
}; 
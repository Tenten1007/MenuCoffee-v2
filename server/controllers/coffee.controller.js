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
    const { name, price, category, has_options, menu_options } = req.body;
    
    // ตรวจสอบว่ามีการอัพโหลดไฟล์หรือไม่
    if (!req.file) {
      return res.status(400).json({ message: 'กรุณาอัพโหลดรูปภาพ' });
    }

    const imagePath = req.file.filename;
    const imageUrl = `/uploads/${imagePath}`;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!name || typeof name !== 'string' || !price || isNaN(Number(price)) || !category || typeof category !== 'string') {
      return res.status(400).json({
        message: "กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง"
      });
    }
    // sanitize
    const safeName = name.trim();
    const safeCategory = category.trim();

    // เช็คชื่อเมนูซ้ำ
    const connection = await pool.getConnection();
    try {
      const [dup] = await connection.query('SELECT id FROM coffees WHERE name = ?', [safeName]);
      if (dup.length > 0) {
        connection.release();
        return res.status(409).json({ message: 'มีเมนูนี้อยู่แล้ว กรุณาตั้งชื่อใหม่' });
      }
    } catch (error) {
      connection.release();
      throw error;
    }

    // เริ่ม transaction
    await connection.beginTransaction();

    try {
      // เพิ่มข้อมูลกาแฟ
      const [result] = await connection.query(
        `INSERT INTO coffees (name, price, base_price, category, image, has_options) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [safeName, price, price, safeCategory, imageUrl, has_options ? 1 : 0]
      );

      const coffeeId = result.insertId;

      // ถ้ามีตัวเลือก ให้เพิ่มตัวเลือกทั้งหมด
      if (has_options && menu_options) {
        let options;
        try {
          options = typeof menu_options === 'string' ? JSON.parse(menu_options) : menu_options;
        } catch (e) {
          return res.status(400).json({ message: 'รูปแบบตัวเลือกไม่ถูกต้อง' });
        }
        for (const option of options) {
          if (!option.option_type || !option.option_name) continue;
          await connection.query(
            `INSERT INTO menu_options (coffee_id, option_type, option_name, price_adjustment, is_available) 
             VALUES (?, ?, ?, ?, ?)`,
            [coffeeId, option.option_type.trim(), option.option_name.trim(), Number(option.price_adjustment) || 0, option.is_available ? 1 : 0]
          );
        }
      }

      await connection.commit();
      res.status(201).json({ 
        id: coffeeId,
        name: safeName,
        price,
        category: safeCategory,
        image: `http://localhost:${process.env.PORT || 5000}${imageUrl}`,
        has_options: has_options ? 1 : 0
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating coffee:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเพิ่มเมนู' });
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
    const { id } = req.params;
    const { name, price, category, has_options, menu_options } = req.body;
    
    // เริ่ม transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // ดึงข้อมูลรูปภาพปัจจุบันจากฐานข้อมูล
      const [currentCoffee] = await connection.query(
        'SELECT image FROM coffees WHERE id = ?',
        [id]
      );

      // กำหนดค่า imageUrl
      let imageUrl = currentCoffee[0]?.image;
      
      // ถ้ามีการอัพโหลดไฟล์ใหม่
      if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
      }

      // sanitize
      const safeName = name && typeof name === 'string' ? name.trim() : '';
      const safeCategory = category && typeof category === 'string' ? category.trim() : '';

      // อัพเดทข้อมูลกาแฟ
      await connection.query(
        `UPDATE coffees 
         SET name = ?, price = ?, category = ?, image = ?, has_options = ?
         WHERE id = ?`,
        [safeName, price, safeCategory, imageUrl, has_options ? 1 : 0, id]
      );

      // ลบตัวเลือกเก่าทั้งหมด
      await connection.query('DELETE FROM menu_options WHERE coffee_id = ?', [id]);

      // เพิ่มตัวเลือกใหม่ทั้งหมด
      if (has_options && menu_options) {
        let options;
        try {
          options = typeof menu_options === 'string' ? JSON.parse(menu_options) : menu_options;
        } catch (e) {
          return res.status(400).json({ message: 'รูปแบบตัวเลือกไม่ถูกต้อง' });
        }
        for (const option of options) {
          if (!option.option_type || !option.option_name) continue;
          await connection.query(
            `INSERT INTO menu_options (coffee_id, option_type, option_name, price_adjustment, is_available) 
             VALUES (?, ?, ?, ?, ?)`,
            [id, option.option_type.trim(), option.option_name.trim(), Number(option.price_adjustment) || 0, option.is_available ? 1 : 0]
          );
        }
      }

      await connection.commit();

      // สร้าง URL แบบเต็มสำหรับรูปภาพ
      const fullImageUrl = imageUrl ? `http://localhost:${process.env.PORT || 5000}${imageUrl}` : null;

      res.json({ 
        message: 'อัพเดทเมนูสำเร็จ',
        coffee: {
          id,
          name: safeName,
          price,
          category: safeCategory,
          image: fullImageUrl,
          has_options: has_options ? 1 : 0
        }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating coffee:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัพเดทเมนู' });
  }
};

// Delete a coffee
exports.delete = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM coffees WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Coffee not found" });
    }
    res.json({ message: "Coffee was deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Error deleting coffee with id " + req.params.id
    });
  }
};

// Get menu options for a coffee
exports.getMenuOptions = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM menu_options WHERE coffee_id = ? AND is_available = 1',
      [req.params.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Error retrieving menu options"
    });
  }
};

// Add a new menu option
exports.addMenuOption = async (req, res) => {
  try {
    const { option_type, option_name, price_adjustment, is_available } = req.body;
    const [result] = await pool.query(
      'INSERT INTO menu_options (coffee_id, option_type, option_name, price_adjustment, is_available) VALUES (?, ?, ?, ?, ?)',
      [req.params.id, option_type, option_name, price_adjustment, is_available ? 1 : 0]
    );
    res.status(201).json({
      id: result.insertId,
      coffee_id: req.params.id,
      option_type,
      option_name,
      price_adjustment,
      is_available
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Error adding menu option"
    });
  }
};

// Update a menu option
exports.updateMenuOption = async (req, res) => {
  try {
    const { option_type, option_name, price_adjustment, is_available } = req.body;
    const [result] = await pool.query(
      'UPDATE menu_options SET option_type = ?, option_name = ?, price_adjustment = ?, is_available = ? WHERE id = ? AND coffee_id = ?',
      [option_type, option_name, price_adjustment, is_available ? 1 : 0, req.params.optionId, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Menu option not found" });
    }
    res.json({
      id: req.params.optionId,
      coffee_id: req.params.id,
      option_type,
      option_name,
      price_adjustment,
      is_available
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Error updating menu option"
    });
  }
};

// Delete a menu option
exports.deleteMenuOption = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM menu_options WHERE id = ? AND coffee_id = ?',
      [req.params.optionId, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Menu option not found" });
    }
    res.json({ message: "Menu option was deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Error deleting menu option"
    });
  }
}; 
const pool = require('../config/db.config');
const { cloudinary } = require('../config/cloudinary.config');

const getPublicIdFromUrl = (url) => {
  try {
    const parts = url.split('/');
    const publicIdWithExtension = parts.slice(parts.indexOf('menu-coffee')).join('/');
    const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));
    return publicId;
  } catch (e) {
    console.error('Could not extract public_id from url:', url);
    return null;
  }
};

// Create a new coffee
exports.create = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { name, price, base_price, category, has_options, menu_options } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'กรุณาอัพโหลดรูปภาพ' });
    }

    const imageUrl = req.file.path; // URL from Cloudinary

    if (!name || !price || !category) {
      return res.status(400).json({
        message: "กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง (ชื่อ, ราคา, หมวดหมู่)"
      });
    }
    
    const safeName = name.trim();
    const safeCategory = category.trim();

    const [dup] = await connection.query('SELECT id FROM coffees WHERE name = ?', [safeName]);
    if (dup.length > 0) {
      connection.release();
      return res.status(409).json({ message: 'มีเมนูนี้อยู่แล้ว กรุณาตั้งชื่อใหม่' });
    }

    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO coffees (name, price, base_price, category, image, has_options) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [safeName, parseFloat(price), parseFloat(base_price) || parseFloat(price), safeCategory, imageUrl, has_options === 'true' || has_options === true ? 1 : 0]
    );

    const coffeeId = result.insertId;

    if ((has_options === 'true' || has_options === true) && menu_options) {
      let options;
      try {
        options = typeof menu_options === 'string' ? JSON.parse(menu_options) : menu_options;
        if (Array.isArray(options)) {
          for (const option of options) {
            if (!option.option_type || !option.option_name) continue;
            await connection.query(
              `INSERT INTO menu_options (coffee_id, option_type, option_name, price_adjustment, is_available) 
               VALUES (?, ?, ?, ?, ?)`,
              [coffeeId, option.option_type.trim(), option.option_name.trim(), Number(option.price_adjustment) || 0, option.is_available === true ? 1 : 0]
            );
          }
        }
      } catch (e) {
        await connection.rollback();
        console.error("Error parsing menu_options:", e);
        return res.status(400).json({ message: 'รูปแบบตัวเลือกไม่ถูกต้อง' });
      }
    }

    await connection.commit();
    
    res.status(201).json({ 
      id: coffeeId,
      name: safeName,
      price,
      base_price,
      category: safeCategory,
      image: imageUrl,
      has_options: has_options === 'true' || has_options === true ? 1 : 0
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error creating coffee:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเพิ่มเมนู' });
  } finally {
    if (connection) connection.release();
  }
};

// Get all coffees
exports.findAll = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM coffees ORDER BY created_at DESC');
    res.json(rows);
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
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Error retrieving coffee with id " + req.params.id
    });
  }
};

// Update a coffee
exports.update = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { name, price, base_price, category, has_options, menu_options } = req.body;
    
    await connection.beginTransaction();

    const [currentCoffeeRows] = await connection.query('SELECT image FROM coffees WHERE id = ?', [id]);
    if (currentCoffeeRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'ไม่พบเมนูที่ต้องการอัพเดท' });
    }
    const currentImage = currentCoffeeRows[0].image;

    let imageUrl = currentImage;
    if (req.file) {
      if (currentImage) {
        const publicId = getPublicIdFromUrl(currentImage);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }
      imageUrl = req.file.path; // New URL from Cloudinary
    }

    const safeName = name ? name.trim() : '';
    const safeCategory = category ? category.trim() : '';

    await connection.query(
      `UPDATE coffees 
       SET name = ?, price = ?, base_price = ?, category = ?, image = ?, has_options = ?
       WHERE id = ?`,
      [safeName, parseFloat(price), parseFloat(base_price) || parseFloat(price), safeCategory, imageUrl, has_options === 'true' || has_options === true ? 1 : 0, id]
    );

    await connection.query('DELETE FROM menu_options WHERE coffee_id = ?', [id]);

    if ((has_options === 'true' || has_options === true) && menu_options) {
      let options;
       try {
        options = typeof menu_options === 'string' ? JSON.parse(menu_options) : menu_options;
        if (Array.isArray(options)) {
          for (const option of options) {
            if (!option.option_type || !option.option_name) continue;
            await connection.query(
              `INSERT INTO menu_options (coffee_id, option_type, option_name, price_adjustment, is_available) 
               VALUES (?, ?, ?, ?, ?)`,
              [id, option.option_type.trim(), option.option_name.trim(), Number(option.price_adjustment) || 0, option.is_available === true ? 1 : 0]
            );
          }
        }
      } catch (e) {
        await connection.rollback();
        console.error("Error parsing menu_options:", e);
        return res.status(400).json({ message: 'รูปแบบตัวเลือกไม่ถูกต้อง' });
      }
    }

    await connection.commit();

    res.json({ 
      message: 'อัพเดทเมนูสำเร็จ',
      coffee: {
        id,
        name: safeName,
        price,
        base_price,
        category: safeCategory,
        image: imageUrl,
        has_options: has_options === 'true' || has_options === true ? 1 : 0
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating coffee:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัพเดทเมนู' });
  } finally {
    if (connection) connection.release();
  }
};

// Delete a coffee
exports.delete = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    await connection.beginTransaction();

    const [rows] = await connection.query('SELECT image FROM coffees WHERE id = ?', [id]);

    if (rows.length > 0 && rows[0].image) {
      const publicId = getPublicIdFromUrl(rows[0].image);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    const [result] = await connection.query('DELETE FROM coffees WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "ไม่พบเมนูที่ต้องการลบ" });
    }
    
    await connection.query('DELETE FROM menu_options WHERE coffee_id = ?', [id]);

    await connection.commit();
    res.json({ message: "ลบเมนูสำเร็จ" });
    
  } catch (error) {
    await connection.rollback();
    console.error("Error deleting coffee:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการลบเมนู"
    });
  } finally {
    if (connection) connection.release();
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
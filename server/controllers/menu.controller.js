const pool = require('../config/db.config');

// Get all menu options
exports.getAllOptions = async (req, res) => {
  try {
    const [options] = await pool.query('SELECT * FROM menu_options ORDER BY category, option_type');
    
    // จัดกลุ่มตัวเลือกตามประเภทเมนู
    const groupedOptions = options.reduce((acc, option) => {
      if (!acc[option.category]) {
        acc[option.category] = [];
      }
      acc[option.category].push(option);
      return acc;
    }, {});

    res.json(groupedOptions);
  } catch (error) {
    console.error('Error getting menu options:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลตัวเลือกเมนู' });
  }
};

// Get menu options by category
exports.getMenuOptions = async (req, res) => {
  try {
    const { category } = req.params;
    const [options] = await pool.query(
      'SELECT option_type, option_value, is_default FROM menu_options WHERE category = ?',
      [category]
    );

    // จัดกลุ่มตัวเลือกตามประเภท
    const groupedOptions = options.reduce((acc, option) => {
      if (!acc[option.option_type]) {
        acc[option.option_type] = [];
      }
      acc[option.option_type].push({
        value: option.option_value,
        isDefault: option.is_default
      });
      return acc;
    }, {});

    res.json(groupedOptions);
  } catch (error) {
    console.error('Error getting menu options:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลตัวเลือกเมนู' });
  }
};

// Get all menu categories
exports.getCategories = async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT DISTINCT category FROM menu_options');
    res.json(categories.map(cat => cat.category));
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลประเภทเมนู' });
  }
};

// Add new menu option
exports.addOption = async (req, res) => {
  try {
    const { category, option_type, option_value, is_default } = req.body;
    
    // ถ้าเป็นค่าเริ่มต้น ให้รีเซ็ตค่าเริ่มต้นของตัวเลือกอื่นๆ ในประเภทเดียวกัน
    if (is_default) {
      await pool.query(
        'UPDATE menu_options SET is_default = false WHERE category = ? AND option_type = ?',
        [category, option_type]
      );
    }

    const [result] = await pool.query(
      'INSERT INTO menu_options (category, option_type, option_value, is_default) VALUES (?, ?, ?, ?)',
      [category, option_type, option_value, is_default]
    );

    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error('Error adding menu option:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเพิ่มตัวเลือกเมนู' });
  }
};

// Update menu option
exports.updateOption = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, option_type, option_value, is_default } = req.body;

    // ถ้าเป็นค่าเริ่มต้น ให้รีเซ็ตค่าเริ่มต้นของตัวเลือกอื่นๆ ในประเภทเดียวกัน
    if (is_default) {
      await pool.query(
        'UPDATE menu_options SET is_default = false WHERE category = ? AND option_type = ? AND id != ?',
        [category, option_type, id]
      );
    }

    await pool.query(
      'UPDATE menu_options SET category = ?, option_type = ?, option_value = ?, is_default = ? WHERE id = ?',
      [category, option_type, option_value, is_default, id]
    );

    res.json({ id, ...req.body });
  } catch (error) {
    console.error('Error updating menu option:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการแก้ไขตัวเลือกเมนู' });
  }
};

// Delete menu option
exports.deleteOption = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM menu_options WHERE id = ?', [id]);
    res.json({ message: 'ลบตัวเลือกเมนูสำเร็จ' });
  } catch (error) {
    console.error('Error deleting menu option:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบตัวเลือกเมนู' });
  }
}; 
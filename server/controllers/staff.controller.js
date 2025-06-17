const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/db.config');
require('dotenv').config();

// ฟังก์ชันสำหรับสร้างพนักงานเริ่มต้น
exports.createInitialStaff = async () => {
  try {
    console.log('Checking for existing admin user...');
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', ['admin']);
    
    if (rows.length === 0) {
      console.log('No admin user found, creating new admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      console.log('Password hashed successfully');
      
      await pool.query(
        'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
        ['admin', hashedPassword, 'Admin User', 'admin']
      );
      console.log('Initial admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error creating initial user:', error);
    throw error;
  }
};

// ฟังก์ชันสำหรับล็อกอิน
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    const user = rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
  }
}; 
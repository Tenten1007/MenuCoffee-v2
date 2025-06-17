const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
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

// ฟังก์ชันสำหรับสร้างพนักงานเริ่มต้น
exports.createInitialStaff = async () => {
  try {
    // ตรวจสอบว่ามีพนักงาน admin อยู่แล้วหรือไม่
    const [rows] = await pool.query('SELECT * FROM staff WHERE username = ?', ['admin']);
    
    if (rows.length === 0) {
      // ถ้าไม่มี ให้สร้างพนักงาน admin ใหม่
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO staff (username, password, name, role) VALUES (?, ?, ?, ?)',
        ['admin', hashedPassword, 'Administrator', 'admin']
      );
      console.log('Initial admin staff created successfully');
    }
  } catch (error) {
    console.error('Error creating initial staff:', error);
    throw error;
  }
};

// ฟังก์ชันสำหรับล็อกอิน
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // ค้นหาพนักงานจาก username
    const [rows] = await pool.query('SELECT * FROM staff WHERE username = ?', [username]);
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    const staff = rows[0];

    // ตรวจสอบรหัสผ่าน
    const isValidPassword = await bcrypt.compare(password, staff.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    // สร้าง JWT token
    const token = jwt.sign(
      { id: staff.id, username: staff.username, role: staff.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      staff: {
        id: staff.id,
        username: staff.username,
        name: staff.name,
        role: staff.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
  }
}; 
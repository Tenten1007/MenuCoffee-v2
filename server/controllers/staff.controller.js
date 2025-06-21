const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/db.config');
require('dotenv').config();

// ฟังก์ชันสำหรับสร้างพนักงานเริ่มต้น
exports.createInitialStaff = async () => {
  try {
    console.log('Checking for existing admin user...');
    const [rows] = await pool.query('SELECT * FROM staff WHERE username = ?', ['admin']);
    
    if (rows.length === 0) {
      console.log('No admin user found, creating new admin user...');
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const hashedPassword = await bcrypt.hash('admin123', saltRounds);
      console.log('Password hashed successfully');
      
      await pool.query(
        'INSERT INTO staff (username, password, role) VALUES (?, ?, ?)',
        ['admin', hashedPassword, 'admin']
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

    // ตรวจสอบ input
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username and password are required' 
      });
    }

    // ตรวจสอบ username format
    if (!/^[a-zA-Z0-9_]{3,50}$/.test(username)) {
      return res.status(400).json({ 
        error: 'Invalid username format' 
      });
    }

    // ตรวจสอบ password length
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    const [rows] = await pool.query(
      'SELECT * FROM staff WHERE username = ?', 
      [username]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ 
        error: 'Invalid username or password' 
      });
    }

    const user = rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid username or password' 
      });
    }

    // สร้าง token
    const tokenPayload = {
      id: user.id,
      username: user.username,
      role: user.role,
      iat: Math.floor(Date.now() / 1000)
    };
    
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      console.error("JWT_SECRET or JWT_REFRESH_SECRET is not defined in .env file");
      return res.status(500).json({ error: "Server configuration error: JWT secrets not found." });
    }

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '24h' 
      }
    );

    // สร้าง refresh token
    const refreshToken = jwt.sign(
      { id: user.id, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET,
      { 
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' 
      }
    );

    // อัพเดท last login
    await pool.query(
      'UPDATE staff SET updated_at = NOW() WHERE id = ?',
      [user.id]
    );

    res.json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

// ฟังก์ชันสำหรับ refresh token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ 
        error: 'Refresh token is required' 
      });
    }

    if (!process.env.JWT_REFRESH_SECRET) {
      console.error("JWT_REFRESH_SECRET is not defined in .env file");
      return res.status(500).json({ error: "Server configuration error: JWT secrets not found." });
    }

    const decoded = jwt.verify(
      refreshToken, 
      process.env.JWT_REFRESH_SECRET
    );

    if (decoded.type !== 'refresh') {
      return res.status(401).json({ 
        error: 'Invalid refresh token' 
      });
    }

    // ตรวจสอบว่าผู้ใช้ยังมีอยู่ในระบบ
    const [rows] = await pool.query(
      'SELECT id, username, role FROM staff WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ 
        error: 'User not found' 
      });
    }

    const user = rows[0];

    // สร้าง token ใหม่
    const newToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '24h' 
      }
    );

    res.json({
      success: true,
      token: newToken
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid refresh token' 
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Refresh token expired' 
      });
    }

    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

// ฟังก์ชันสำหรับ logout
exports.logout = async (req, res) => {
  try {
    // ในระบบจริงควรเก็บ blacklist token
    // แต่สำหรับระบบนี้จะให้ client ลบ token เอง
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Error in logout:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

// ฟังก์ชันสำหรับเปลี่ยนรหัสผ่าน
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.staffData.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Current password and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'New password must be at least 6 characters long' 
      });
    }

    // ดึงข้อมูลผู้ใช้
    const [rows] = await pool.query(
      'SELECT password FROM staff WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // ตรวจสอบรหัสผ่านปัจจุบัน
    const isValidPassword = await bcrypt.compare(
      currentPassword, 
      rows[0].password
    );

    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Current password is incorrect' 
      });
    }

    // เข้ารหัสรหัสผ่านใหม่
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // อัพเดทรหัสผ่าน
    await pool.query(
      'UPDATE staff SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedNewPassword, userId]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
}; 
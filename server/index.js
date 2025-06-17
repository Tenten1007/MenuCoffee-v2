const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');
const http = require('http');
const { Server } = require('socket.io');
const { createInitialStaff } = require('./controllers/staff.controller');
const staffController = require('./controllers/staff.controller');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.set('socketio', io);

// Middleware
app.use(cors());
app.use(express.json());

// กำหนด path ของโฟลเดอร์ uploads
const uploadsDir = path.join(__dirname, 'uploads');

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// ตั้งค่า static files หลังจากกำหนด path ของ uploads
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/coffees', require('./routes/coffee.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/staff', require('./routes/staff.routes'));

// Upload route
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({ 
      url: `http://localhost:5000/uploads/${req.file.filename}` 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// สร้าง connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'coffee_menu_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ฟังก์ชันสำหรับสร้างฐานข้อมูลและตาราง
async function initializeDatabase() {
  try {
    // สร้างฐานข้อมูล
    await pool.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'coffee_menu_db'}`);
    console.log('Database created or already exists');

    // ใช้ฐานข้อมูล
    await pool.query(`USE ${process.env.DB_NAME || 'coffee_menu_db'}`);

    // อ่านไฟล์ SQL
    const initSqlPath = path.join(__dirname, 'db', 'init.sql');
    const sql = fs.readFileSync(initSqlPath, 'utf8');

    // แยกคำสั่ง SQL และรันเฉพาะคำสั่งสร้างตาราง
    const createTableStatements = sql
      .split(';')
      .filter(stmt => stmt.trim().toLowerCase().startsWith('create table'));
    
    for (const statement of createTableStatements) {
      if (statement.trim()) {
        await pool.query(statement);
      }
    }
    console.log('Tables created successfully');

    // Check if initial user exists
    const [users] = await pool.query('SELECT COUNT(*) as count FROM users');
    if (users[0].count === 0) {
      console.log('Creating initial user...');
      await createInitialStaff();
      console.log('Initial user created');
    } else {
      console.log('Users already exist, skipping initial user creation');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// เรียกใช้ฟังก์ชันเริ่มต้นฐานข้อมูล
initializeDatabase()
  .then(() => {
    console.log('Database initialization completed');
  })
  .catch(error => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });

httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 
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
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import security middleware
const {
  createRateLimiter,
  createSlowDown,
  sanitizeInput,
  securityHeaders,
  validateFileUpload,
  errorHandler,
  notFoundHandler
} = require('./middleware/security');

// Import upload middleware
const { upload, handleUploadError } = require('./middleware/upload.middleware');

const app = express();
const port = process.env.PORT || 5000;

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

app.set('socketio', io);

// Security headers
app.use(securityHeaders);

// CORS configuration
const allowedOrigins = [process.env.CLIENT_ORIGIN || 'http://localhost:5173'];
app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const apiLimiter = createRateLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  'Too many requests from this IP, please try again later.'
);

const loginLimiter = createRateLimiter(
  parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  parseInt(process.env.LOGIN_RATE_LIMIT_MAX_REQUESTS) || 5,
  'Too many login attempts, please try again later.'
);

// Slow down
const speedLimiter = createSlowDown(
  15 * 60 * 1000, // 15 minutes
  100, // delay after 100 requests
  500 // add 500ms delay per request after 100
);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'default-secret'));

// Input sanitization
app.use(sanitizeInput);

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/staff/login', loginLimiter);
app.use('/api/', speedLimiter);

// กำหนด path ของโฟลเดอร์ uploads
const uploadsDir = path.join(__dirname, 'uploads');

// ตั้งค่า static files หลังจากกำหนด path ของ uploads
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, path) => {
    // Set security headers for static files
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'DENY');
  }
}));

// Routes
app.use('/api/coffees', require('./routes/coffee.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/staff', require('./routes/staff.routes'));

// Upload route with enhanced security
app.post('/api/upload', 
  upload.single('image'), 
  validateFileUpload,
  handleUploadError,
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      res.json({ 
        success: true,
        url: `${process.env.CLIENT_ORIGIN || 'http://localhost:5000'}/uploads/${req.file.filename}` 
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'File upload failed' });
    }
  }
);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
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

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Client Origin: ${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  httpServer.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// --- HTTPS Example (for production) ---
// const https = require('https');
// const fs = require('fs');
// const privateKey = fs.readFileSync('/path/to/privkey.pem', 'utf8');
// const certificate = fs.readFileSync('/path/to/fullchain.pem', 'utf8');
// const credentials = { key: privateKey, cert: certificate };
// const httpsServer = https.createServer(credentials, app);
// httpsServer.listen(process.env.PORT || 5000, () => {
//   console.log('HTTPS Server running on port ' + (process.env.PORT || 5000));
// });
// --- End HTTPS Example --- 
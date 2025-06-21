const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// กำหนด path ของโฟลเดอร์ uploads
const uploadsDir = path.join(__dirname, '..', 'uploads');

// สร้างโฟลเดอร์ uploads ถ้ายังไม่มี
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// File filter function
const fileFilter = (req, file, cb) => {
  // ตรวจสอบ MIME type
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error('Only image files are allowed'), false);
  }

  // ตรวจสอบ file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (!allowedExtensions.includes(fileExtension)) {
    return cb(new Error('Invalid file extension'), false);
  }

  cb(null, true);
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // สร้างชื่อไฟล์ที่ปลอดภัย
    const uniqueName = uuidv4();
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const safeFilename = `${uniqueName}${fileExtension}`;
    cb(null, safeFilename);
  }
});

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1 // อนุญาตให้อัพโหลดได้ 1 ไฟล์ต่อครั้ง
  },
  fileFilter: fileFilter
});

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File size too large. Maximum size is 5MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files. Only one file is allowed.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Unexpected file field.'
      });
    }
  }

  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({
      error: 'Only image files (JPEG, PNG, GIF, WebP) are allowed.'
    });
  }

  if (error.message === 'Invalid file extension') {
    return res.status(400).json({
      error: 'Invalid file extension. Allowed extensions: .jpg, .jpeg, .png, .gif, .webp'
    });
  }

  console.error('File upload error:', error);
  return res.status(500).json({
    error: 'File upload failed'
  });
};

// Clean up old files function
const cleanupOldFiles = async () => {
  try {
    const files = fs.readdirSync(uploadsDir);
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
        console.log(`Deleted old file: ${file}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up old files:', error);
  }
};

// Run cleanup every day
setInterval(cleanupOldFiles, 24 * 60 * 60 * 1000);

module.exports = {
  upload,
  handleUploadError,
  cleanupOldFiles
}; 
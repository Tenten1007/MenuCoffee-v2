const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config();
const { createInitialStaff } = require('../controllers/staff.controller');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'coffee_menu_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function initializeDatabase() {
  try {
    await pool.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'coffee_menu_db'}`);
    console.log('Database created or already exists');
    await pool.query(`USE ${process.env.DB_NAME || 'coffee_menu_db'}`);
    const initSqlPath = path.join(__dirname, '../db', 'init.sql');
    const sql = fs.readFileSync(initSqlPath, 'utf8');
    const statements = sql.split(';').filter(stmt => stmt.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await pool.query(statement);
        } catch (error) {
          console.error('Error executing SQL statement:', error);
          console.error('Statement:', statement);
        }
      }
    }
    console.log('Database schema and initial data created successfully');
    try {
      const [staff] = await pool.query('SELECT COUNT(*) as count FROM staff');
      if (staff[0].count === 0) {
        console.log('Creating initial staff...');
        await createInitialStaff();
        console.log('Initial staff created');
      } else {
        console.log('Staff already exist, skipping initial staff creation');
      }
    } catch (error) {
      console.error('Error checking staff table:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

initializeDatabase()
  .then(() => {
    console.log('Database initialization completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }); 
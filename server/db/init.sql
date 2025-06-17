-- Create database
CREATE DATABASE IF NOT EXISTS coffee_menu_db;
USE coffee_menu_db;

-- Create tables
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'staff', 'customer') NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coffees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image VARCHAR(255),
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customerName VARCHAR(100) NOT NULL,
    orderTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    sweetness VARCHAR(50),
    temperature VARCHAR(50),
    notes TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- ตารางสำหรับเก็บประวัติออเดอร์
CREATE TABLE IF NOT EXISTS order_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customerName VARCHAR(100) NOT NULL,
    orderTime TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_history_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_history_id INT,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    sweetness VARCHAR(50),
    temperature VARCHAR(50),
    notes TEXT,
    FOREIGN KEY (order_history_id) REFERENCES order_history(id)
);

-- Insert coffee menu items
INSERT INTO coffees (name, description, price, image, category) VALUES
-- กาแฟ
('คาปูชิโน่', 'กาแฟเอสเปรสโซ่ผสมนมร้อนและโฟมนม', 45.00, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'coffee'),
('ลาเต้', 'กาแฟเอสเปรสโซ่ผสมนมร้อน', 45.00, 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'coffee'),
('มอคค่า', 'กาแฟเอสเปรสโซ่ผสมช็อคโกแลตและนมร้อน', 50.00, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'coffee'),
('อเมริกาโน่', 'กาแฟเอสเปรสโซ่ผสมน้ำร้อน', 40.00, 'https://images.unsplash.com/photo-1551036663-4c9d2dae8d3d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'coffee'),
('เอสเปรสโซ่', 'กาแฟดำเข้มข้น', 35.00, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'coffee'),

-- ชา
('ชาเขียว', 'ชาเขียวญี่ปุ่นแท้', 45.00, 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'tea'),
('ชาดำ', 'ชาดำอังกฤษแท้', 40.00, 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'tea'),
('ชานม', 'ชาดำผสมนมข้นหวาน', 45.00, 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'tea'),
('ชาเขียวนม', 'ชาเขียวผสมนมสด', 50.00, 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'tea'),

-- อิตาเลี่ยนโซดา
('บลูฮาวาย', 'น้ำโซดาผสมไซรัปบลูคูราเซา', 55.00, 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'italian-soda'),
('สตรอว์เบอร์รี่', 'น้ำโซดาผสมไซรัปสตรอว์เบอร์รี่', 55.00, 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'italian-soda'),
('วานิลลา', 'น้ำโซดาผสมไซรัปวานิลลา', 55.00, 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'italian-soda'),
('คาราเมล', 'น้ำโซดาผสมไซรัปคาราเมล', 55.00, 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'italian-soda'),

-- เบเกอรี่
('ครัวซองต์', 'ขนมปังชั้นกรอบนอกนุ่มใน', 35.00, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'bakery'),
('มัฟฟิน', 'ขนมปังนุ่มรสช็อคโกแลต', 30.00, 'https://images.unsplash.com/photo-1607958996333-41aaf7caefaa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'bakery'),
('บราวนี่', 'ขนมหวานรสช็อคโกแลต', 40.00, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'bakery'),
('ชีสเค้ก', 'เค้กชีสเนื้อนุ่ม', 45.00, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'bakery'),

-- เมนูแนะนำ
('กาแฟเย็นสูตรพิเศษ', 'กาแฟเย็นผสมคาราเมลและวิปครีม', 65.00, 'https://images.unsplash.com/photo-1559868725-d7e7d6b3e3e0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'recommended'),
('ชาผลไม้รวม', 'ชาผลไม้สดชื่น', 60.00, 'https://images.unsplash.com/photo-1576092769492-c9e7e7e6b0d0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'recommended'),

-- นม
('นมสด', 'นมสดแท้ 100%', 30.00, 'https://images.unsplash.com/photo-1628191012173-b3c4f7b0f0b0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'milk'),
('นมช็อคโกแลต', 'นมสดผสมช็อคโกแลต', 35.00, 'https://images.unsplash.com/photo-1628191012173-b3c4f7b0f0b0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'milk'),

-- ขนม
('คุกกี้ช็อกโกแลตชิพ', 'คุกกี้อบกรอบช็อกโกแลตชิพ', 25.00, 'https://images.unsplash.com/photo-1582236113110-3e2b2e2d2e2c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'snack'),
('โดนัท', 'โดนัทเคลือบน้ำตาล', 20.00, 'https://images.unsplash.com/photo-1551036663-4c9d2dae8d3d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'snack'),

-- ใบชา
('ชาอู่หลง', 'ชาจีนคั่วหอม', 50.00, 'https://images.unsplash.com/photo-1567675971512-1f251c6c5a3d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'leaf-tea'),
('ชาคาโมมายล์', 'ชาสมุนไพรช่วยผ่อนคลาย', 45.00, 'https://images.unsplash.com/photo-1567675971512-1f251c6c5a3d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'leaf-tea'),

-- มัทฉะ
('มัทฉะลาเต้', 'มัทฉะเข้มข้นผสมนม', 60.00, 'https://images.unsplash.com/photo-1625902148102-3f1a0a5b2b2b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'matcha'),
('มัทฉะเพียว', 'มัทฉะ 100%', 55.00, 'https://images.unsplash.com/photo-1625902148102-3f1a0a5b2b2b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'matcha'),

-- อาหาร
('แซนด์วิชแฮมชีส', 'แซนด์วิชแฮมและชีส', 70.00, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'food'),
('สลัดอกไก่', 'สลัดผักสดพร้อมอกไก่ย่าง', 85.00, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'food'); 
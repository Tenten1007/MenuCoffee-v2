-- Create database
CREATE DATABASE IF NOT EXISTS coffee_menu_db;
USE coffee_menu_db;

-- Create tables
CREATE TABLE IF NOT EXISTS staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coffees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    price DECIMAL(10,2) NOT NULL,
    base_price DECIMAL(10,2),
    category VARCHAR(100),
    image VARCHAR(255),
    has_options BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coffee_id INT,
    option_type VARCHAR(50) NOT NULL,
    option_name VARCHAR(100) NOT NULL,
    price_adjustment DECIMAL(10,2) DEFAULT 0.00,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (coffee_id) REFERENCES coffees(id) ON DELETE CASCADE
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
    name VARCHAR(255),
    price DECIMAL(10,2),
    quantity INT,
    total_price DECIMAL(10,2) DEFAULT NULL,
    selected_options JSON DEFAULT NULL,
    note TEXT,
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
INSERT INTO coffees (name, price, base_price, category, image, has_options) VALUES
-- กาแฟ
('คาปูชิโน่', 45.00, 45.00, 'coffee', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 1),
('ลาเต้', 45.00, 45.00, 'coffee', 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 1),
('มอคค่า', 50.00, 50.00, 'coffee', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 1),
('อเมริกาโน่', 40.00, 40.00, 'coffee', 'https://images.unsplash.com/photo-1551036663-4c9d2dae8d3d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 1),
('เอสเปรสโซ่', 35.00, 35.00, 'coffee', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 1),

-- ชา
('ชาเขียว', 45.00, 45.00, 'tea', 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 1),
('ชาดำ', 40.00, 40.00, 'tea', 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 1),
('ชานม', 45.00, 45.00, 'tea', 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 1),
('ชาเขียวนม', 50.00, 50.00, 'tea', 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 1),

-- อิตาเลี่ยนโซดา
('บลูฮาวาย', 55.00, 55.00, 'italian-soda', 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 1),
('สตรอว์เบอร์รี่', 55.00, 55.00, 'italian-soda', 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 1),
('วานิลลา', 55.00, 55.00, 'italian-soda', 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 1),
('คาราเมล', 55.00, 55.00, 'italian-soda', 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 1),

-- เบเกอรี่
('ครัวซองต์', 35.00, 35.00, 'bakery', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 1),
('มัฟฟิน', 30.00, 30.00, 'bakery', 'https://images.unsplash.com/photo-1607958996333-41aaf7caefaa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 1),
('บราวนี่', 40.00, 40.00, 'bakery', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 1),
('ชีสเค้ก', 45.00, 45.00, 'bakery', 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 1),

-- เมนูแนะนำ
('กาแฟเย็นสูตรพิเศษ', 65.00, 65.00, 'recommended', 'https://images.unsplash.com/photo-1559868725-d7e7d6b3e3e0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 1),
('ชาผลไม้รวม', 60.00, 60.00, 'recommended', 'https://images.unsplash.com/photo-1576092769492-c9e7e7e6b0d0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 1),

-- นม
('นมสด', 30.00, 30.00, 'milk', 'https://images.unsplash.com/photo-1628191012173-b3c4f7b0f0b0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 1),
('นมช็อคโกแลต', 35.00, 35.00, 'milk', 'https://images.unsplash.com/photo-1628191012173-b3c4f7b0f0b0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 1),

-- ขนม
('คุกกี้ช็อกโกแลตชิพ', 25.00, 25.00, 'snack', 'https://images.unsplash.com/photo-1582236113110-3e2b2e2d2e2c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 1),
('โดนัท', 20.00, 20.00, 'snack', 'https://images.unsplash.com/photo-1551036663-4c9d2dae8d3d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 1),

-- ใบชา
('ชาอู่หลง', 50.00, 50.00, 'leaf-tea', 'https://images.unsplash.com/photo-1567675971512-1f251c6c5a3d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 1),
('ชาคาโมมายล์', 45.00, 45.00, 'leaf-tea', 'https://images.unsplash.com/photo-1567675971512-1f251c6c5a3d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 1),

-- มัทฉะ
('มัทฉะลาเต้', 60.00, 60.00, 'matcha', 'https://images.unsplash.com/photo-1625902148102-3f1a0a5b2b2b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 1),
('มัทฉะเพียว', 55.00, 55.00, 'matcha', 'https://images.unsplash.com/photo-1625902148102-3f1a0a5b2b2b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 1),

-- อาหาร
('แซนด์วิชแฮมชีส', 70.00, 70.00, 'food', 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 1),
('สลัดอกไก่', 85.00, 85.00, 'food', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 1);

-- เพิ่ม staff ตัวอย่าง
INSERT INTO staff (username, password, role) VALUES ('admin', '$2b$10$3kdkwP9FQKDhG1NnkytdHOxxdYxabPuMRHYq.W20EJlQfOy4F7Vva', 'admin'); 
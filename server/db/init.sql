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

-- Create staff table if not exists
CREATE TABLE IF NOT EXISTS staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert initial data
INSERT INTO users (username, password, name, role) VALUES
('admin', '$2b$10$X7UrH5UxX5UxX5UxX5UxX.5UxX5UxX5UxX5UxX5UxX5UxX5UxX5U', 'Admin User', 'admin');

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
('มัฟฟิน', 'ขนมปังนุ่มรสช็อคโกแลต', 30.00, 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'bakery'),
('บราวนี่', 'ขนมหวานรสช็อคโกแลต', 40.00, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'bakery'),
('ชีสเค้ก', 'เค้กชีสเนื้อนุ่ม', 45.00, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'bakery'); 
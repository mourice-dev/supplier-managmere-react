-- Database for Supplier Management System (ProCureSys+)
CREATE DATABASE IF NOT EXISTS supplier_management_system1;
USE supplier_management_system1;

-- Users Table (RBAC)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'User', -- 'Admin' or 'User'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Default Admin and User
INSERT IGNORE INTO users (username, password, role) VALUES ('admin', 'admin123', 'Admin');
INSERT IGNORE INTO users (username, password, role) VALUES ('user', 'user123', 'User');

-- Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Procurement Requests Table
-- Central part of the workflow: User Creates Request -> Admin Approves
CREATE TABLE IF NOT EXISTS procurement_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    estimated_price DECIMAL(10, 2) NOT NULL,
    department VARCHAR(100),
    description TEXT,
    status VARCHAR(50) DEFAULT 'Pending', -- Pending, Approved, Rejected
    supplier_id INT NULL, -- Assigned upon approval
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

-- Purchase Orders Table
-- Automatically generated when a request is approved.
CREATE TABLE IF NOT EXISTS purchase_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT, -- Link to the request
    supplier_id INT,
    item_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending', -- Pending, Completed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES procurement_requests(id) ON DELETE SET NULL,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

-- Payments Table
-- Automatically generated or linked after an order is fulfilled.
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT, -- Link to the purchase order
    supplier_id INT,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50), 
    status VARCHAR(50) DEFAULT 'Pending', -- Pending, Completed, Failed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES purchase_orders(id) ON DELETE SET NULL,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

-- Notifications Table
-- System generates notifications for workflow events.
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    type VARCHAR(50), -- info, success, warning, error
    request_id INT NULL, -- Used to link directly to the procurement request that triggered this
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES procurement_requests(id) ON DELETE SET NULL
);

-- Dashboard View (Optional, provides a simple query for stats if not handled purely via DAOs)
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM suppliers) AS total_suppliers,
    (SELECT COUNT(*) FROM procurement_requests WHERE status = 'Pending') AS pending_requests,
    (SELECT COUNT(*) FROM purchase_orders) AS total_orders,
    (SELECT SUM(amount) FROM payments WHERE status = 'Completed') AS total_revenue;

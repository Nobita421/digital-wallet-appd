SET FOREIGN_KEY_CHECKS = 0;

-- Users table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    original_id VARCHAR(255) UNIQUE NOT NULL, -- Store original Prisma ID for reference
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(255),
    avatar VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Wallets table
CREATE TABLE wallets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    original_id VARCHAR(255) UNIQUE NOT NULL,
    balance DECIMAL(19,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Accounts table
CREATE TABLE accounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    original_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL,
    account_number VARCHAR(255),
    bank_name VARCHAR(255),
    card_type VARCHAR(50),
    last_four VARCHAR(4),
    expiry_date VARCHAR(10),
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Transactions table
CREATE TABLE transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    original_id VARCHAR(255) UNIQUE NOT NULL,
    type ENUM('DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'BILL_PAYMENT', 'REFUND') NOT NULL,
    amount DECIMAL(19,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    description TEXT,
    status ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED') DEFAULT 'PENDING',
    reference VARCHAR(255) UNIQUE,
    metadata JSON,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Transfers table
CREATE TABLE transfers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    original_id VARCHAR(255) UNIQUE NOT NULL,
    amount DECIMAL(19,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    description TEXT,
    status ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED') DEFAULT 'PENDING',
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bills table
CREATE TABLE bills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    original_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(19,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    due_date DATE NOT NULL,
    category ENUM('UTILITIES', 'RENT', 'INSURANCE', 'SUBSCRIPTION', 'OTHER') NOT NULL,
    status ENUM('PENDING', 'PAID', 'OVERDUE', 'CANCELLED') DEFAULT 'PENDING',
    description TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_date VARCHAR(50),
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Budgets table
CREATE TABLE budgets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    original_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(19,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    category VARCHAR(255) NOT NULL,
    period ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY') DEFAULT 'MONTHLY',
    spent DECIMAL(19,2) DEFAULT 0.00,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- QR Codes table
CREATE TABLE qr_codes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    original_id VARCHAR(255) UNIQUE NOT NULL,
    code VARCHAR(255) UNIQUE NOT NULL,
    amount DECIMAL(19,2),
    currency VARCHAR(3) DEFAULT 'USD',
    purpose VARCHAR(255) NOT NULL,
    metadata JSON,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert data (converting timestamps and relationships)
INSERT INTO users (original_id, email, name, phone, avatar, is_verified, created_at, updated_at) VALUES
('cmfurffxs0000svlv7ls9z6vf', 'john.doe@example.com', 'John Doe', '+1234567890', NULL, TRUE, FROM_UNIXTIME(1758523400560/1000), FROM_UNIXTIME(1758523400560/1000));

INSERT INTO wallets (original_id, balance, currency, user_id, created_at, updated_at) VALUES
('cmfurffxu0002svlvqplv9veo', 2540.50, 'USD', 1, FROM_UNIXTIME(1758523400562/1000), FROM_UNIXTIME(1758523400562/1000));

INSERT INTO accounts (original_id, name, account_type, account_number, bank_name, card_type, last_four, expiry_date, is_default, is_active, user_id, created_at, updated_at) VALUES
('cmfurffxz000csvlvhrv24nv4', 'Chase Bank Account', 'bank', '****1234', 'Chase', NULL, NULL, NULL, TRUE, TRUE, 1, FROM_UNIXTIME(1758523400568/1000), FROM_UNIXTIME(1758523400568/1000)),
('cmfurffy0000esvlv79jg05uk', 'Visa Card', 'card', NULL, NULL, 'visa', '4242', '12/25', FALSE, TRUE, 1, FROM_UNIXTIME(1758523400568/1000), FROM_UNIXTIME(1758523400568/1000));

INSERT INTO transactions (original_id, type, amount, currency, description, status, reference, metadata, user_id, created_at, updated_at) VALUES
('cmfurffxv0004svlvucvykmhj', 'DEPOSIT', 1000.00, 'USD', 'Bank Transfer', 'COMPLETED', 'TXN_001', NULL, 1, FROM_UNIXTIME(1758523400564/1000), FROM_UNIXTIME(1758523400564/1000)),
('cmfurffxw0006svlvvm4dzort', 'BILL_PAYMENT', 85.00, 'USD', 'Electricity Bill', 'COMPLETED', 'TXN_002', NULL, 1, FROM_UNIXTIME(1758523400565/1000), FROM_UNIXTIME(1758523400565/1000)),
('cmfurffxx0008svlveksfelco', 'WITHDRAWAL', 120.50, 'USD', 'Coffee Shop', 'COMPLETED', 'TXN_003', NULL, 1, FROM_UNIXTIME(1758523400566/1000), FROM_UNIXTIME(1758523400566/1000)),
('cmfurffxy000asvlvq28ritlf', 'DEPOSIT', 500.00, 'USD', 'Payment from Jane Smith', 'COMPLETED', 'TXN_004', NULL, 1, FROM_UNIXTIME(1758523400567/1000), FROM_UNIXTIME(1758523400567/1000));

INSERT INTO bills (original_id, name, amount, currency, due_date, category, status, description, is_recurring, recurring_date, user_id, created_at, updated_at) VALUES
('cmfurffy2000gsvlv3flwbavu', 'Electricity Bill', 85.00, 'USD', FROM_UNIXTIME(1706745600000/1000), 'UTILITIES', 'PAID', 'Monthly electricity bill', FALSE, NULL, 1, FROM_UNIXTIME(1758523400570/1000), FROM_UNIXTIME(1758523400570/1000)),
('cmfurffy3000isvlvrgdy6xwr', 'Internet Bill', 59.99, 'USD', FROM_UNIXTIME(1707091200000/1000), 'UTILITIES', 'PENDING', 'Monthly internet bill', FALSE, NULL, 1, FROM_UNIXTIME(1758523400571/1000), FROM_UNIXTIME(1758523400571/1000));

INSERT INTO budgets (original_id, name, amount, currency, category, period, spent, start_date, end_date, is_active, user_id, created_at, updated_at) VALUES
('cmfurffy4000ksvlvq7t0auo6', 'Food & Dining', 500.00, 'USD', 'Food', 'MONTHLY', 234.50, FROM_UNIXTIME(1704067200000/1000), FROM_UNIXTIME(1706659200000/1000), TRUE, 1, FROM_UNIXTIME(1758523400572/1000), FROM_UNIXTIME(1758523400572/1000)),
('cmfurffy5000msvlvf0rqnibd', 'Transportation', 200.00, 'USD', 'Transport', 'MONTHLY', 87.25, FROM_UNIXTIME(1704067200000/1000), FROM_UNIXTIME(1706659200000/1000), TRUE, 1, FROM_UNIXTIME(1758523400573/1000), FROM_UNIXTIME(1758523400573/1000));

SET FOREIGN_KEY_CHECKS = 1;
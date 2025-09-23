PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "avatar" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO users VALUES('cmfurffxs0000svlv7ls9z6vf','john.doe@example.com','John Doe','+1234567890',NULL,1,1758523400560,1758523400560);
CREATE TABLE IF NOT EXISTS "wallets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "balance" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO wallets VALUES('cmfurffxu0002svlvqplv9veo',2540.5,'USD','cmfurffxs0000svlv7ls9z6vf',1758523400562,1758523400562);
CREATE TABLE IF NOT EXISTS "accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "accountNumber" TEXT,
    "bankName" TEXT,
    "cardType" TEXT,
    "lastFour" TEXT,
    "expiryDate" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO accounts VALUES('cmfurffxz000csvlvhrv24nv4','Chase Bank Account','bank','****1234','Chase',NULL,NULL,NULL,1,1,'cmfurffxs0000svlv7ls9z6vf',1758523400568,1758523400568);
INSERT INTO accounts VALUES('cmfurffy0000esvlv79jg05uk','Visa Card','card',NULL,NULL,'visa','4242','12/25',0,1,'cmfurffxs0000svlv7ls9z6vf',1758523400568,1758523400568);
CREATE TABLE IF NOT EXISTS "transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reference" TEXT,
    "metadata" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO transactions VALUES('cmfurffxv0004svlvucvykmhj','DEPOSIT',1000.0,'USD','Bank Transfer','COMPLETED','TXN_001',NULL,'cmfurffxs0000svlv7ls9z6vf',1758523400564,1758523400564);
INSERT INTO transactions VALUES('cmfurffxw0006svlvvm4dzort','BILL_PAYMENT',85.0,'USD','Electricity Bill','COMPLETED','TXN_002',NULL,'cmfurffxs0000svlv7ls9z6vf',1758523400565,1758523400565);
INSERT INTO transactions VALUES('cmfurffxx0008svlveksfelco','WITHDRAWAL',120.5,'USD','Coffee Shop','COMPLETED','TXN_003',NULL,'cmfurffxs0000svlv7ls9z6vf',1758523400566,1758523400566);
INSERT INTO transactions VALUES('cmfurffxy000asvlvq28ritlf','DEPOSIT',500.0,'USD','Payment from Jane Smith','COMPLETED','TXN_004',NULL,'cmfurffxs0000svlv7ls9z6vf',1758523400567,1758523400567);
CREATE TABLE IF NOT EXISTS "transfers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "transfers_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "transfers_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "bills" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "dueDate" DATETIME NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringDate" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "bills_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO bills VALUES('cmfurffy2000gsvlv3flwbavu','Electricity Bill',85.0,'USD',1706745600000,'UTILITIES','PAID','Monthly electricity bill',0,NULL,'cmfurffxs0000svlv7ls9z6vf',1758523400570,1758523400570);
INSERT INTO bills VALUES('cmfurffy3000isvlvrgdy6xwr','Internet Bill',59.99000000000000198,'USD',1707091200000,'UTILITIES','PENDING','Monthly internet bill',0,NULL,'cmfurffxs0000svlv7ls9z6vf',1758523400571,1758523400571);
CREATE TABLE IF NOT EXISTS "budgets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "category" TEXT NOT NULL,
    "period" TEXT NOT NULL DEFAULT 'MONTHLY',
    "spent" REAL NOT NULL DEFAULT 0,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "budgets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO budgets VALUES('cmfurffy4000ksvlvq7t0auo6','Food & Dining',500.0,'USD','Food','MONTHLY',234.5,1704067200000,1706659200000,1,'cmfurffxs0000svlv7ls9z6vf',1758523400572,1758523400572);
INSERT INTO budgets VALUES('cmfurffy5000msvlvf0rqnibd','Transportation',200.0,'USD','Transport','MONTHLY',87.25,1704067200000,1706659200000,1,'cmfurffxs0000svlv7ls9z6vf',1758523400573,1758523400573);
CREATE TABLE IF NOT EXISTS "qr_codes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "amount" REAL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "purpose" TEXT NOT NULL,
    "metadata" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" DATETIME,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "qr_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "wallets_userId_key" ON "wallets"("userId");
CREATE UNIQUE INDEX "transactions_reference_key" ON "transactions"("reference");
CREATE UNIQUE INDEX "qr_codes_code_key" ON "qr_codes"("code");
COMMIT;

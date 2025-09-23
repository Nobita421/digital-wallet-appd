
#!/bin/bash

echo "Starting data migration from SQLite to MySQL..."

# Export data from SQLite
sqlite3 digital_wallet_app/prisma/dev.db <<EOF
.headers on
.mode csv
.output users.csv
SELECT * FROM users;
.output wallets.csv
SELECT * FROM wallets;
.output transactions.csv
SELECT * FROM transactions;
.output transfers.csv
SELECT * FROM transfers;
.quit
EOF

# Import data to MySQL
mysql -u wallet_user -p digital_wallet <<EOF
LOAD DATA LOCAL INFILE 'users.csv'
INTO TABLE users
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

LOAD DATA LOCAL INFILE 'wallets.csv'
INTO TABLE wallets
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

LOAD DATA LOCAL INFILE 'transactions.csv'
INTO TABLE transactions
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

LOAD DATA LOCAL INFILE 'transfers.csv'
INTO TABLE transfers
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;
EOF

echo "Data migration completed!"

# Cleanup CSV files
rm users.csv wallets.csv transactions.csv transfers.csv
